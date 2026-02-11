import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: 6,
          position: 'relative',
        }}
      >
        {/* X shape - first diagonal */}
        <div
          style={{
            position: 'absolute',
            width: 20,
            height: 4,
            backgroundColor: 'white',
            transform: 'rotate(45deg)',
            borderRadius: 2,
          }}
        />
        {/* X shape - second diagonal */}
        <div
          style={{
            position: 'absolute',
            width: 20,
            height: 4,
            backgroundColor: 'white',
            transform: 'rotate(-45deg)',
            borderRadius: 2,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
