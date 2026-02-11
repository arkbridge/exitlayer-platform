import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1c18 0%, #064e3b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
          position: 'relative',
        }}
      >
        {/* X shape - first diagonal */}
        <div
          style={{
            position: 'absolute',
            width: 110,
            height: 22,
            backgroundColor: 'white',
            transform: 'rotate(45deg)',
            borderRadius: 11,
          }}
        />
        {/* X shape - second diagonal */}
        <div
          style={{
            position: 'absolute',
            width: 110,
            height: 22,
            backgroundColor: 'white',
            transform: 'rotate(-45deg)',
            borderRadius: 11,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
