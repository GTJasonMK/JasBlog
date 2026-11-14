import Link from "next/link";

export default function NotFound() {
  return <section className="site-message"><p className="site-message-code">404</p><h1>这一页暂时找不到</h1><p>页面不存在，或暂未公开。</p><Link href="/" className="btn-primary">返回首页</Link></section>;
}
