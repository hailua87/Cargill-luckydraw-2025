
export interface Guest {
  id: string;
  fullName: string;
  phone: string;
  department: string;
  checkInTime: number;
}

export interface Prize {
  id: string;
  name: string;
  item: string;
  quantity: number;
  remaining: number;
}

export interface Winner {
  id: string;
  guestId: string;
  guestName: string;
  prizeId: string;
  prizeName: string;
  timestamp: number;
}

export type View = 'checkin' | 'admin' | 'luckydraw' | 'winners';
