import { useState, useEffect } from 'react';
import './PromoCarousel.css';

const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/images/products/system-1.jpg',
      quote: 'Build Your Dream Gaming Rig',
      subtext: 'Premium components for ultimate performance',
      gradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)',
    },
    {
      id: 2,
      image: '/images/products/system-2.jpg',
      quote: 'Power Up Your Gaming Experience',
      subtext: 'High-end hardware for serious gamers',
      gradient: 'linear-gradient(135deg, rgba(240, 147, 251, 0.7) 0%, rgba(245, 87, 108, 0.7) 100%)',
    },
    {
      id: 3,
      image: '/images/products/system-3.jpg',
      quote: 'Upgrade Your System Today',
      subtext: 'Latest technology at unbeatable prices',
      gradient: 'linear-gradient(135deg, rgba(79, 172, 254, 0.7) 0%, rgba(0, 242, 254, 0.7) 100%)',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="promo-carousel">
      <div className="carousel-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            <div 
              className="slide-gradient-overlay"
              style={{
                background: slide.gradient,
              }}
            ></div>
            <div className="slide-overlay"></div>
            <div className="slide-content">
              <h2 className="slide-quote">{slide.quote}</h2>
              <p className="slide-subtext">{slide.subtext}</p>
            </div>
          </div>
        ))}
        
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoCarousel;

