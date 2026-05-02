import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { customerAccountRequest, CUSTOMER_ORDERS_QUERY } from '@/lib/customerAccount';
import { isAuthenticated } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customerInfo, setCustomerInfo] = useState<{ id: string; name: string; email: string } | null>(null);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (isAuthenticated()) {
      checkPurchaseStatus();
    }
  }, [productId]);

  useEffect(() => {
    if (customerInfo && reviews.length > 0) {
      const alreadyReviewed = reviews.some(r => r.customer_name === customerInfo.name); // Simple check, ideally use customer_id
      setHasAlreadyReviewed(alreadyReviewed);
    }
  }, [customerInfo, reviews]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const response = (await customerAccountRequest(CUSTOMER_ORDERS_QUERY, { first: 50 })) as any;
      if (response?.data?.customer) {
        const customer = response.data.customer;
        const cId = customer.id;
        
        setCustomerInfo({
          id: cId,
          name: customer.displayName || `${customer.firstName} ${customer.lastName}`,
          email: customer.emailAddress?.emailAddress || ''
        });

        // Robust ID matching (handling potential GID prefix differences)
        const normalizeId = (id: string) => id.replace('gid://shopify/Product/', '');
        const targetId = normalizeId(productId);

        const orders = customer.orders.edges;
        const purchased = orders.some((order: any) => 
          order.node.lineItems.nodes.some((item: any) => normalizeId(item.productId) === targetId)
        );
        setHasPurchased(purchased);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo || !hasPurchased) {
      toast.error('Only customers who purchased this product can leave a review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert([
        {
          product_id: productId,
          customer_id: customerInfo.id,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          rating,
          comment,
        },
      ]);

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReviewForm = () => {
    if (!isAuthenticated()) {
      return (
        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="text-muted-foreground">Please log in to write a review.</p>
        </div>
      );
    }

    if (!hasPurchased) {
      return (
        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="text-muted-foreground">Only verified buyers can leave a review for this product.</p>
        </div>
      );
    }

    if (hasAlreadyReviewed) {
      return (
        <div className="bg-green-50 p-6 rounded-lg text-center border border-green-100">
          <p className="text-green-700 font-medium">Thank you! You have already reviewed this product.</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="bg-secondary/30 p-6 rounded-lg space-y-4">
        <h3 className="font-semibold">Write a Review</h3>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Share your thoughts about this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Post Review'}
        </Button>
      </form>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating) ? 'fill-primary text-primary' : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{averageRating.toFixed(1)} out of 5</span>
            <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {renderReviewForm()}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{review.customer_name}</span>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Purchase
                  </div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};
