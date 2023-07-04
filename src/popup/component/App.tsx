import { Header } from './Header.tsx'
import { Histories } from './Histories.tsx'
import { useGetHistories } from '../hooks/useGetHistories.ts'
import { deleteRecord, NotFoundRecordError, recoveryPageWithNewTab } from '../../background/client.ts'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const App: React.FC = () => {
  const { t } = useTranslation()
  const [histories, setHistories] = useGetHistories()
  const clickTrashButtonHandler = async (url: string): Promise<void> => {
    // レコードが裏で消されていても特に問題はない
    await deleteRecord(url)
    const newHistories = histories.filter((record) => record.url !== url)
    setHistories(newHistories)
  }

  const recoveryRecordHandler = async (url: string): Promise<void> => {
    try {
      await recoveryPageWithNewTab(url)
    } catch (error: unknown) {
      if (error instanceof NotFoundRecordError) {
        alert(t('RecordNotFoundAlert'))
        const newHistories = histories.filter((record) => record.url !== url)
        setHistories(newHistories)
      } else {
        throw error
      }
    }
  }

  return (
        <>
            <Header recordCount={histories.length}/>
            <Histories histories={histories} clickTrashButtonHandler={clickTrashButtonHandler} recoveryRecordHandler={recoveryRecordHandler}/>
        </>
  )
}
