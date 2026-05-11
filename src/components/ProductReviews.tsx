import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Star, User } from 'lucide-react';
import { toast } from 'sonner';
import { isAuthenticated } from '@/lib/auth';
import { customerAccountRequest, CUSTOMER_ORDERS_QUERY } from '@/lib/customerAccount';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  reviewer_name: string;
  created_at: string;
}

export const ProductReviews = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  const [canReview, setCanReview] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!isAuthenticated()) {
        setAuthChecked(true);
        return;
      }
      try {
        const data = await customerAccountRequest(CUSTOMER_ORDERS_QUERY, { first: 50 });
        type OrderEdge = { node: { lineItems?: { nodes?: { productId?: string | number }[] } } };
        const orders = (data as { data?: { customer?: { orders?: { edges?: OrderEdge[] } } } })?.data?.customer?.orders?.edges?.map(e => e.node) || [];
        
        let hasPurchased = false;
        for (const order of orders) {
          const items = order.lineItems?.nodes || [];
          for (const item of items) {
            const rawCurrentId = productId.split('/').pop();
            const rawItemId = item.productId ? String(item.productId).split('/').pop() : '';
            if (rawCurrentId === rawItemId && rawCurrentId) {
              hasPurchased = true;
              break;
            }
          }
          if (hasPurchased) break;
        }
        setCanReview(hasPurchased);
      } catch (err) {
        console.error("Error checking purchases:", err);
      } finally {
        setAuthChecked(true);
      }
    };
    checkPurchase();
  }, [productId]);

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet, ignore
          setReviews([]);
        } else {
          console.error('Error fetching reviews:', error);
        }
      } else {
        setReviews(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [productId, fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert([
          {
            product_id: productId,
            rating,
            title,
            content,
            reviewer_name: reviewerName,
          }
        ]);

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setShowForm(false);
      setRating(5);
      setTitle('');
      setContent('');
      setReviewerName('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Check if the table exists.');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-16 border-t border-border pt-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Number(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-muted text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold">{averageRating} out of 5</span>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        </div>
        {authChecked ? (
          canReview ? (
            <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="rounded-xl">
              {showForm ? 'Cancel Review' : 'Write a Review'}
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-xl flex items-center gap-2">
              <User className="w-4 h-4" />
              Verified buyers only
            </div>
          )
        ) : (
          <div className="h-10 w-32 bg-muted animate-pulse rounded-xl" />
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-6 rounded-2xl mb-10 border border-border">
          <h3 className="text-xl font-semibold mb-6">Write your review</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Beautiful piece!"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Review Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              placeholder="What did you like or dislike about this product?"
              required
            />
          </div>

          <Button type="submit" disabled={submitting} className="rounded-xl px-8 py-6 text-md">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-border rounded-2xl p-6 bg-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  {review.title && <h4 className="font-semibold text-lg">{review.title}</h4>}
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <p className="text-foreground leading-relaxed mb-4">{review.content}</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/50 w-fit px-3 py-1.5 rounded-full">
                <User className="w-4 h-4" />
                {review.reviewer_name}
                <span className="ml-1 text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs">Verified Buyer</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border border-dashed">
          <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">Be the first to share your thoughts about this beautiful piece of jewellery.</p>
          {authChecked ? (
            canReview ? (
              <Button variant="outline" onClick={() => setShowForm(true)} className="rounded-xl">
                Write the first review
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-xl mx-auto w-fit mt-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Only verified buyers can leave a review
              </div>
            )
          ) : (
            <div className="h-10 w-48 bg-muted animate-pulse rounded-xl mx-auto" />
          )}
        </div>
      )}
    </div>
  );
};
