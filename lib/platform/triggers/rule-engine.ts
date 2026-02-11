import { createClient } from '@supabase/supabase-js';
import { TriggerRule, Execution, Skill } from '@/types';
import { gatherContext } from '@/lib/platform/executor/context-builder';
import { executeSkill } from '@/lib/platform/executor/skill-runner';
import { routeAction } from '@/lib/platform/executor/action-router';

// Service client for backend operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface TriggerResult {
  executionId: string;
  status: 'completed' | 'queued' | 'failed';
  output?: string;
  error?: string;
}

export async function processTrigger(
  triggerRule: TriggerRule,
  triggerEvent: Record<string, unknown>,
  organizationId: string
): Promise<TriggerResult> {
  const supabase = getServiceClient();

  // Create execution record
  const { data: execution, error: insertError } = await supabase
    .from('executions')
    .insert({
      organization_id: organizationId,
      trigger_rule_id: triggerRule.id,
      skill_id: triggerRule.skill_id,
      trigger_event: triggerEvent,
      status: 'running',
    })
    .select()
    .single();

  if (insertError || !execution) {
    console.error('Failed to create execution:', insertError);
    return {
      executionId: '',
      status: 'failed',
      error: 'Failed to create execution record',
    };
  }

  try {
    // Get the skill
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', triggerRule.skill_id)
      .single();

    if (skillError || !skill) {
      throw new Error('Skill not found');
    }

    // Gather context from connected platforms
    const context = await gatherContext(
      organizationId,
      skill.config?.required_context || [],
      triggerEvent
    );

    // Update execution with gathered context
    await supabase
      .from('executions')
      .update({ context_gathered: context })
      .eq('id', execution.id);

    // Build skill input
    const skillInput = {
      trigger_event: triggerEvent,
      context,
      skill_config: skill.config,
    };

    // Execute the skill
    const { output, tokensUsed } = await executeSkill(
      organizationId,
      skill,
      skillInput
    );

    // Route the action (auto-execute or queue for approval)
    const routeResult = await routeAction(
      organizationId,
      execution.id,
      triggerRule,
      output
    );

    // Update execution with results
    await supabase
      .from('executions')
      .update({
        skill_input: skillInput,
        skill_output: output,
        status: routeResult.queued ? 'awaiting_approval' : 'completed',
        action_taken: routeResult.action,
        tokens_used: tokensUsed,
        completed_at: routeResult.queued ? null : new Date().toISOString(),
      })
      .eq('id', execution.id);

    return {
      executionId: execution.id,
      status: routeResult.queued ? 'queued' : 'completed',
      output,
    };
  } catch (error) {
    // Update execution with error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await supabase
      .from('executions')
      .update({
        status: 'failed',
        error: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', execution.id);

    return {
      executionId: execution.id,
      status: 'failed',
      error: errorMessage,
    };
  }
}

export async function processManualSkillRun(
  skillId: string,
  organizationId: string,
  manualInput: Record<string, unknown>
): Promise<TriggerResult> {
  const supabase = getServiceClient();

  // Create execution record
  const { data: execution, error: insertError } = await supabase
    .from('executions')
    .insert({
      organization_id: organizationId,
      skill_id: skillId,
      trigger_event: { type: 'manual', input: manualInput },
      status: 'running',
    })
    .select()
    .single();

  if (insertError || !execution) {
    console.error('Failed to create execution:', insertError);
    return {
      executionId: '',
      status: 'failed',
      error: 'Failed to create execution record',
    };
  }

  try {
    // Get the skill
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (skillError || !skill) {
      throw new Error('Skill not found');
    }

    // Gather context if required
    const context = await gatherContext(
      organizationId,
      skill.config?.required_context || [],
      manualInput
    );

    // Build skill input
    const skillInput = {
      manual_input: manualInput,
      context,
      skill_config: skill.config,
    };

    // Execute the skill
    const { output, tokensUsed } = await executeSkill(
      organizationId,
      skill,
      skillInput
    );

    // Update execution with results (manual runs don't route to destinations)
    await supabase
      .from('executions')
      .update({
        skill_input: skillInput,
        skill_output: output,
        status: 'completed',
        action_taken: 'displayed',
        tokens_used: tokensUsed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', execution.id);

    return {
      executionId: execution.id,
      status: 'completed',
      output,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await supabase
      .from('executions')
      .update({
        status: 'failed',
        error: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', execution.id);

    return {
      executionId: execution.id,
      status: 'failed',
      error: errorMessage,
    };
  }
}

export async function retryExecution(executionId: string): Promise<TriggerResult> {
  const supabase = getServiceClient();

  // Get the original execution
  const { data: execution, error } = await supabase
    .from('executions')
    .select('*, trigger_rules(*), skills(*)')
    .eq('id', executionId)
    .single();

  if (error || !execution) {
    return {
      executionId,
      status: 'failed',
      error: 'Execution not found',
    };
  }

  // Re-process the trigger
  if (execution.trigger_rule_id) {
    return processTrigger(
      execution.trigger_rules,
      execution.trigger_event || {},
      execution.organization_id
    );
  } else {
    return processManualSkillRun(
      execution.skill_id,
      execution.organization_id,
      execution.trigger_event?.input || {}
    );
  }
}
