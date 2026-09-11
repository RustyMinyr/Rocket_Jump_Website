import type { Metadata } from 'next';
import { GameAdmin } from '@/components/GameAdmin';

export const metadata: Metadata = {title:'Admin · RocketJump',description:'RocketJump sign in.',robots:{index:false,follow:false}};
export default function AdminPage(){return <GameAdmin/>;}
