import { redirect } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  // 重定向到登录页面
  redirect('/login');
}
