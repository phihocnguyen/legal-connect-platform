interface QuestionCardProps {
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  stats: {
    votes: number;
    answers: number;
    views: number;
  };
  tags: string[];
  timeAgo: string;
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";

export function QuestionCard({
  title,
  excerpt,
  author,
  stats,
  tags,
  timeAgo,
}: QuestionCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex flex-col items-center w-20">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <span className="font-semibold">{stats.votes}</span>
            <span className="text-xs">votes</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={stats.answers > 0 ? "text-green-600 border-green-600" : ""}
          >
            <span className="font-semibold">{stats.answers}</span>
            <span className="text-xs">answers</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <span className="font-semibold">{stats.views}</span>
            <span className="text-xs">views</span>
          </Button>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold hover:text-blue-600 cursor-pointer">
            {title}
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{excerpt}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Button key={tag} variant="secondary" size="sm">
              {tag}
            </Button>
          ))}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="relative w-6 h-6 mr-2">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              className="rounded-full"
            />
          </div>
          <span className="hover:text-blue-600 cursor-pointer mr-2">
            {author.name}
          </span>
          <span>asked {timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
}
