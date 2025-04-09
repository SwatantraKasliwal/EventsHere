import React, { useState, useEffect } from "react";
import "./Carousel.css";

function Carousel({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="carousel-container">
      <h3 className="carousel-title">Major Events</h3>
      <div className="carousel">
        <button className="carousel-button prev" onClick={prevSlide}>
          &lt;
        </button>
        <div className="carousel-slides">
          {slides.map((slide, index) => (
            <div
              className={`carousel-slide ${
                index === currentSlide ? "active" : ""
              }`}
              key={index}
              style={{
                transform: `translateX(${100 * (index - currentSlide)}%)`,
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="carousel-image"
              />
              <div className="carousel-content">
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
                {slide.link && (
                  <a href={slide.link} className="carousel-link">
                    <button className="carousel-details-button">
                      Learn More
                    </button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-button next" onClick={nextSlide}>
          &gt;
        </button>
      </div>
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`carousel-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default Carousel;
