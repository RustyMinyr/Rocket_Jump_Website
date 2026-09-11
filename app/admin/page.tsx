import type { Metadata } from 'next';
import { GameAdmin } from '@/components/GameAdmin';

export const metadata: Metadata = {title:'Game insights · RocketJump',robots:{index:false,follow:false}};
export default function AdminPage(){return <GameAdmin/>;}
