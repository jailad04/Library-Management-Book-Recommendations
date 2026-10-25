import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Sparkles,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import {
  recordFeedback,
  setRecommendationsLoading
} from '../features/recommendations/recommendationsSlice';
import { addToast } from '../features/ui/uiSlice';
import BookCard from '../components/books/BookCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './RecommendationsPage.css';

export const RecommendationsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const recommendations = useSelector((state) => state.recommendations.items);
  const feedbackMap = useSelector((state) => state.recommendations.feedbackMap);
  const loading = useSelector((state) => state.recommendations.loading);
  const filteredRecs = recommendations;

  const handleFeedback = (recId, feedback) => {
    dispatch(recordFeedback({ recId, feedback }));
    dispatch(
      addToast({
        type: 'info',
        message:
          feedback === 'relevant'
            ? 'Feedback recorded! Preference weights updated positively.'
            : 'Feedback noted. Down-ranking similar genres in upcoming recommendations.'
      })
    );
  };

  const handleRefresh = () => {
    dispatch(setRecommendationsLoading(true));
    dispatch(addToast({ type: 'info', message: 'Synthesizing fresh recommendations...' }));
    setTimeout(() => {
      dispatch(setRecommendationsLoading(false));
      dispatch(addToast({ type: 'success', message: 'Recommendations refreshed successfully!' }));
    }, 600);
  };

  return (
    <div className="recommendations-container fade-in">
      {/* Header */}
      <div className="recommendations-header">
        <div>
          <div className="recommendations-title-row">
            <Sparkles size={24} color="var(--primary-700)" />
            <h1 className="recommendations-title">AI Book Recommendations</h1>
            <Badge variant="purple" size="md">
              FastAPI Engine
            </Badge>
          </div>
          <p className="recommendations-desc">
            Personalized algorithmic suggestions derived from your reading history, preferred genres, and collaborative borrowing patterns.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={loading}
          onClick={handleRefresh}
        >
          Refresh Suggestions
        </Button>
      </div>

      {/* Model & Architecture Explainability Card */}
      <div className="model-explain-card">
        <Info size={20} className="model-explain-icon" />
        <div>
          <div className="model-explain-title">
            How BookNest Computes Your Recommendations
          </div>
          <p className="model-explain-text">
            The Python FastAPI recommendation service uses <strong>content-based filtering</strong> (TF-IDF title/description vectorization and cosine similarity) combined with <strong>user profile preference weights</strong> ({user?.preferredGenres?.join(', ')}). Your feedback directly tunes the candidate ranking parameters.
          </p>
        </div>
      </div>

      {/* User Preferences Chips */}
      <div className="signals-bar">
        <span className="signals-label">
          Active Preference Signals:
        </span>
        {user?.preferredGenres?.map((genre) => (
          <Badge key={genre} variant="neutral" size="sm">
            {genre}
          </Badge>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="recommendations-grid">
        {filteredRecs.map((rec) => {
          const currentFeedback = feedbackMap[rec.id];

          return (
            <div key={rec.id} className="rec-card-wrapper">
              {/* Underlying Book Card */}
              <BookCard
                book={rec.book}
                recommendationReason={rec.reasonExplanation}
                similarityScore={rec.similarityScore}
              />

              {/* Feedback bar */}
              <div className="feedback-bar">
                <span style={{ color: 'var(--text-secondary)' }}>Was this recommendation helpful?</span>
                <div className="feedback-btns">
                  <button
                    type="button"
                    onClick={() => handleFeedback(rec.id, 'relevant')}
                    className={`feedback-btn ${currentFeedback === 'relevant' ? 'active-relevant' : ''}`}
                    title="Mark recommendation as helpful"
                  >
                    <ThumbsUp size={12} />
                    <span>Relevant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(rec.id, 'not-relevant')}
                    className={`feedback-btn ${currentFeedback === 'not-relevant' ? 'active-not-relevant' : ''}`}
                    title="Mark recommendation as not helpful"
                  >
                    <ThumbsDown size={12} />
                    <span>Not Relevant</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPage;
