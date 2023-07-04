import type { SVGProps } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const EmptyMessage: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  const { t } = useTranslation()

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={215} height={204} {...props}>
      <title>{t('AriaLabelForEmptyHistoryImage')}</title>
      <g fill="none" fillRule="nonzero" transform="translate(1)">
        <path
          stroke="#DBE5EA"
          strokeLinecap="round"
          strokeWidth={3}
          d="m20 61 4.472 4.472M198.033 35.967l-3.505 3.505"
        />
        <path
          fill="#DBE5EA"
          stroke="#DBE5EA"
          d="M19.5 143.5h4v4h-4zM111.5.5h3v3h-3z"
        />
        <path stroke="#DBE5EA" strokeWidth={2} d="M209 81h4v4h-4z" />
        <g stroke="#DBE5EA" strokeLinecap="round" strokeWidth={2}>
          <path d="M204.5 134.5h6M207.5 137.5v-6" />
        </g>
        <g stroke="#DBE5EA" strokeLinecap="round" strokeWidth={2}>
          <path d="m32.89 17.89 7.07 7.07M32.89 24.96l7.07-7.07" />
        </g>
        <circle cx={150.5} cy={41.5} r={5.5} stroke="#DBE5EA" strokeWidth={2} />
        <circle cx={3.5} cy={96.5} r={3.5} stroke="#DBE5EA" strokeWidth={2} />
        <circle
          cx={84}
          cy={45}
          r={2}
          fill="#DBE5EA"
          stroke="#DBE5EA"
          strokeWidth={2}
        />
        <circle cx={110.5} cy={134.5} r={69.5} fill="#F5F9F9" />
        <g fill="#C2D3D7">
          <path d="M83.296 146h32.449a2.287 2.287 0 0 0 2.296-2.278v-2.746a30.664 30.664 0 0 0 14.86-8.919c.562-.61.747-1.474.484-2.259l-.679-2.02h2.202c.822 0 1.58-.436 1.99-1.142A30.443 30.443 0 0 0 141 111.383v-4.105c0-.682-.309-1.329-.84-1.762a2.312 2.312 0 0 0-1.906-.472c-14.396 2.857-24.805 15.418-24.805 30.018v6.382H83.296A2.287 2.287 0 0 0 81 143.722 2.287 2.287 0 0 0 83.296 146Zm34.745-10.938c0-11.431 7.573-21.47 18.367-24.85v1.17c0 4.12-.988 8.187-2.866 11.84h-4.022c-.737 0-1.431.352-1.862.946a2.264 2.264 0 0 0-.316 2.052l1.248 3.713a26.052 26.052 0 0 1-10.55 6.303v-1.174Z" />
          <path d="M143.145 96h-64.29C75.067 96 72 99.215 72 103.008v54.844a6.863 6.863 0 0 0 6.855 6.855h23.904l-2.322 4.723h-7.718a2.285 2.285 0 1 0 0 4.57h36.715a2.285 2.285 0 1 0 0-4.57h-7.718l-2.323-4.723h23.752a6.863 6.863 0 0 0 6.855-6.855v-54.844c0-3.787-3.06-7.008-6.855-7.008Zm-64.29 4.57h64.29c1.217 0 2.285 1.14 2.285 2.438v47.988H76.57v-47.988c0-1.299 1.068-2.438 2.285-2.438Zm37.767 68.86H105.53l2.323-4.723h6.447l2.322 4.723Zm26.523-9.293h-64.29a2.288 2.288 0 0 1-2.285-2.285v-2.286h68.86v2.286a2.288 2.288 0 0 1-2.285 2.285Z" />
        </g>
      </g>
    </svg>
  )
}
