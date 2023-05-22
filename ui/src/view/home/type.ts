export type Game = {
  dateTime: string;
  league: string;
  num?: string;
  source: 'tiCai' | 'extra';
  teamList: string[];
  itemList: {
    oddsTitle: string;
    oddsItemList: string[][];
  }[];
  ecid: '6841929';
};
