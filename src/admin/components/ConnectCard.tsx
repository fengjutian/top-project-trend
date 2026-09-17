// Shown when no GitHub token is in sessionStorage. Manages its own input
// state and only emits the token when the user clicks the connect button.

import {useState} from 'react';
import {KeyRound, BookOpen} from 'lucide-react';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';

export default function ConnectCard({onConnect}: {onConnect: (token: string) => void}) {
  const [token, setToken] = useState('');
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md border-border/70 shadow-md">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Content Studio
          </div>
          <CardTitle className="font-serif text-2xl">连接 GitHub</CardTitle>
          <CardDescription className="reading-prose mx-auto">
            使用只授权当前仓库 Contents 读写权限的 Fine-grained Token。Token 仅保存在当前浏览器会话,关闭标签页后清除。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="github_pat_..."
              className="pl-9"
              autoFocus
            />
          </div>
          <Button
            type="button"
            onClick={() => onConnect(token.trim())}
            disabled={!token.trim()}
            className="w-full"
            size="lg"
          >
            进入管理后台
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            推荐使用 Fine-grained Personal Access Token,只授予 <span className="font-mono">fengjutian/top-project-trend</span> 仓库的 Contents 读写权限。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}