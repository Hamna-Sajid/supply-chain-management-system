"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function RatingsPage() {
  const [ratings, setRatings] = useState<any[]>([]);
  useEffect(() => { api.get("/supplier/ratings").then(r => setRatings(r.data)).catch(console.error); }, []);
  const avg = ratings.length ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1) : "N/A";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Ratings & Reviews</h1>
      <Card><CardContent className="pt-6"><p className="text-5xl font-bold text-yellow-500">{avg} ⭐</p><p className="text-slate-500 mt-1">{ratings.length} reviews</p></CardContent></Card>
      <div className="space-y-3">
        {ratings.map((r, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex gap-1 mb-1">{[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}/>)}</div>
              <p className="text-slate-600 text-sm">{r.comment}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}