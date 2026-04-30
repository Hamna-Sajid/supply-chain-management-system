'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, MessageSquare } from 'lucide-react';
import { manufacturerApi } from '@/lib/api';
import { toast } from 'sonner';

interface ReviewTarget {
    supplier_id: string;
    supplier_name: string;
    orders_count: number;
    last_order_date: string;
    last_review: {
        rating_value: number;
        review?: string;
        created_at: string;
    } | null;
}

interface GivenReview {
    rating_id: string;
    supplier_id: string;
    supplier_name: string;
    rating_value: number;
    review?: string;
    created_at: string;
}

export default function ManufacturerReviewsPage() {
    const [targets, setTargets] = useState<ReviewTarget[]>([]);
    const [reviews, setReviews] = useState<GivenReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [supplierId, setSupplierId] = useState('');
    const [ratingValue, setRatingValue] = useState(0);
    const [reviewText, setReviewText] = useState('');

    const selectedSupplier = useMemo(
        () => targets.find((t) => t.supplier_id === supplierId),
        [targets, supplierId]
    );

    const loadData = async () => {
        setLoading(true);
        try {
            const [targetData, reviewData] = await Promise.all([
                manufacturerApi.getSupplierReviewTargets(),
                manufacturerApi.getGivenSupplierReviews(),
            ]);

            setTargets(targetData ?? []);
            setReviews(reviewData ?? []);

            if (!supplierId && (targetData?.length ?? 0) > 0) {
                setSupplierId(targetData[0].supplier_id);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error ?? 'Failed to load reviews data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async () => {
        if (!supplierId) {
            toast.error('Please select a supplier first.');
            return;
        }

        if (ratingValue < 1 || ratingValue > 5) {
            toast.error('Please choose a rating between 1 and 5 stars.');
            return;
        }

        setSubmitting(true);
        try {
            await manufacturerApi.addSupplierReview({
                supplier_id: supplierId,
                rating_value: ratingValue,
                review: reviewText.trim() || undefined,
            });

            toast.success('Review submitted successfully.');
            setRatingValue(0);
            setReviewText('');
            await loadData();
        } catch (err: any) {
            toast.error(err?.response?.data?.error ?? 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const fmtDate = (value?: string) => {
        if (!value) return 'Unknown';
        try {
            return new Date(value).toLocaleDateString();
        } catch {
            return value;
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#2d6a4f]">Ratings & Reviews</h1>
                <p className="text-gray-600 mt-2">Rate suppliers you have previously ordered from</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#2D6A4F]" />
                            Add Supplier Review
                        </CardTitle>
                        <CardDescription>Only suppliers from your order history are available</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <p className="text-sm text-gray-500">Loading suppliers...</p>
                        ) : targets.length === 0 ? (
                            <p className="text-sm text-gray-500">No suppliers found. Place an order first, then you can add reviews.</p>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                    <select
                                        value={supplierId}
                                        onChange={(e) => setSupplierId(e.target.value)}
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        style={{ borderColor: '#B7E4C7' }}
                                    >
                                        {targets.map((target) => (
                                            <option key={target.supplier_id} value={target.supplier_id}>
                                                {target.supplier_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedSupplier && (
                                    <div className="text-xs text-gray-600 bg-gray-50 border rounded-md p-3">
                                        <p>Orders with supplier: {selectedSupplier.orders_count}</p>
                                        <p>Last order date: {fmtDate(selectedSupplier.last_order_date)}</p>
                                        {selectedSupplier.last_review && (
                                            <p>
                                                Last review: {selectedSupplier.last_review.rating_value} stars on{' '}
                                                {fmtDate(selectedSupplier.last_review.created_at)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setRatingValue(value)}
                                                className="p-1"
                                                aria-label={`Set rating to ${value}`}
                                            >
                                                <Star
                                                    className={`w-6 h-6 ${value <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                                />
                                            </button>
                                        ))}
                                        <span className="text-sm text-gray-600 ml-2">
                                            {ratingValue > 0 ? `${ratingValue}/5` : 'Select'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                                    <Input
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Share your experience with this supplier"
                                        style={{ borderColor: '#B7E4C7' }}
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full text-white"
                                    style={{ backgroundColor: '#2D6A4F' }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="lg:col-span-2">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Your Submitted Reviews</CardTitle>
                            <CardDescription>{reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-sm text-gray-500">Loading reviews...</p>
                            ) : reviews.length === 0 ? (
                                <p className="text-sm text-gray-500">No reviews submitted yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {reviews.map((review) => (
                                        <div key={review.rating_id} className="border rounded-lg p-4 bg-white">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-[#2D6A4F]">{review.supplier_name}</p>
                                                <p className="text-xs text-gray-500">{fmtDate(review.created_at)}</p>
                                            </div>
                                            <div className="mt-2 flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                    <Star
                                                        key={value}
                                                        className={`w-4 h-4 ${value <= review.rating_value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-700 mt-2">{review.review || 'No written feedback provided.'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
