'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, AlertCircle } from 'lucide-react';
import { analyticsApi, PerformanceReport } from '@/lib/api';

export default function RatingsPage() {
  const [report, setReport]   = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await analyticsApi.getPerformance();
      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">Failed to load ratings</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <Button className="mt-4" onClick={loadReport}>Retry</Button>
        </div>
      </div>
    );
  }

  const ratingsData   = report?.ratings;
  const avgRating     = ratingsData?.average ?? 0;
  const totalRatings  = ratingsData?.total ?? 0;
  const distribution  = ratingsData?.distribution ?? {};
  const recentReviews = ratingsData?.recent ?? [];

  // Build sorted star distribution [5,4,3,2,1]
  const starDist = [5, 4, 3, 2, 1].map(star => ({
    stars: star,
    count: distribution[star] ?? 0,
  }));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Ratings & Reviews</h1>
        <p className="text-gray-600 mt-2">Customer feedback and performance metrics</p>
      </div>

      {totalRatings === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Star className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No ratings yet</p>
            <p className="text-gray-500 text-sm mt-1">Ratings from your customers will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-gray-700">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-6">
                  <div>
                    <div className="text-5xl font-bold text-[#2D6A4F] leading-none">
                      {avgRating.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">out of 5.0</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#2D6A4F] leading-none">{totalRatings}</p>
                    <p className="text-xs text-gray-500 mt-2">total ratings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-gray-700">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {starDist.map(({ stars, count }) => (
                    <div key={stars} className="flex items-center gap-2">
                      <div className="w-12 text-sm font-medium text-gray-700">{stars} star</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#2D6A4F] h-2 rounded-full transition-all"
                          style={{ width: totalRatings > 0 ? `${(count / totalRatings) * 100}%` : '0%' }}
                        />
                      </div>
                      <div className="w-8 text-right text-sm text-gray-600">{count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Customer Reviews</CardTitle>
              <CardDescription>Feedback from manufacturers</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No written reviews yet</p>
              ) : (
                <div className="space-y-6">
                  {recentReviews.map((review, i) => (
                    <div
                      key={i}
                      className="pb-6"
                      style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.given_by?.name ?? 'Anonymous'}
                          </h4>
                          <div className="mt-1">{renderStars(review.rating_value)}</div>
                        </div>
                        {review.created_at && (
                          <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm mt-3">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
