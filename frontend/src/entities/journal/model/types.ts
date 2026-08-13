export interface MyJournalFeed {
  id: string
  date: string
  stockName: string
  tradeType: '매수' | '매도' | '관망'
  content: string
}

export interface SharedJournalFeed {
  id: string
  author: string
  stockName: string
  category: '노하우' | '원칙' | '복기'
  content: string
  likes: number
}

export interface RecommendedCommitment {
  id: string
  situationTag: string
  stockName: string
  content: string
}
