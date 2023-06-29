import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { getAllRecords } from '../../background/client.ts'

import { type Record } from '../../content_script/handler.ts'

export const useGetHistories = (): [Record[], Dispatch<SetStateAction<Record[]>>] => {
  const [histories, setHistories] = useState<Record[]>([])

  useEffect(() => {
    const getHistories = async (): Promise<void> => {
      const histories = await getAllRecords()
      setHistories(histories)
    }
    getHistories()
  }, [])

  return [histories, setHistories]
}
