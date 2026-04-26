'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    customer: 'ABC Manufacturing',
    rating: 5,
    comment: 'Excellent quality materials and on-time delivery. Highly recommended!',
  },
  {
    id: 2,
    customer: 'XYZ Industries',
    rating: 4,
    comment: 'Good products, but packaging could be improved.',
  },
  {
    id: 3,
    customer: 'Global Tech',
    rating: 5,
    comment: 'Outstanding service and great communication throughout the process.',
  },
  {
    id: 4,
    customer: 'Prime Motors',
    rating: 4,
    comment: 'Materials meet specifications. Delivery was slightly delayed.',
  },
  {
    id: 5,
    customer: 'Elite Parts Co',
    rating: 5,
    comment: 'Perfect quality and very competitive pricing. Will order again!',
  },
];

const starDistribution = [
  { stars: 5, count: 85 },
  { stars: 4, count: 24 },
  { stars: 3, count: 8 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

const totalRatings = starDistribution.reduce((sum, item) => sum + item.count, 0);
const averageRating = (
  starDistribution.reduce((sum, item) => sum + item.stars * item.count, 0) / totalRatings
).toFixed(1);

export default function RatingsPage() {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Ratings & Reviews</h1>
        <p className="text-gray-600 mt-2">Customer feedback and performance metrics</p>
      </div>

      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Average Rating */}
        <Card className="shadow-sm" style={{ borderLeft: '4px solid #2D6A4F' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-700">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-6">
              <div>
                <div className="text-5xl font-bold text-[#2D6A4F] leading-none">{averageRating}</div>
                <p className="text-sm text-gray-500 mt-2">out of 5.0</p>
              </div>
              <div className="text-center min-w-[96px]">
                <p className="text-3xl font-bold text-[#2D6A4F] leading-none">{totalRatings}</p>
                <p className="text-xs text-gray-500 mt-2 leading-tight">total ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Star Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-700">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {starDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <div className="w-12 text-sm font-medium text-gray-700">{item.stars} star</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#2D6A4F] h-2 rounded-full"
                      style={{ width: `${(item.count / totalRatings) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm text-gray-600">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Customer Reviews</CardTitle>
          <CardDescription>Feedback from manufacturers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="pb-6"
                style={{ borderBottomColor: '#F0F0F0', borderBottomWidth: '1px' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.customer}</h4>
                    <div className="mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mt-3">{review.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
