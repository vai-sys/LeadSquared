
import React, { useState, useEffect, useRef } from 'react';

const InfiniteScroll=()=> {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef();
  const lastImageRef = useRef();

  const fetchImages = async (pageNum) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.thecatapi.com/v1/images/search?limit=5&page=${pageNum}&order=Desc`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }
      
      setImages(prev => [...prev, ...data]);
      setPage(pageNum + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
    fetchImages(page);
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchImages(page);
      }
    }, options);

    if (lastImageRef.current) {
      observer.current.observe(lastImageRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loading, page]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-4 m-4 bg-red-50 rounded-lg shadow">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {images.map((image, index) => {
        const isLastElement = index === images.length - 1;
        
        return (
          <div
            key={image.id}
            ref={isLastElement ? lastImageRef : null}
            className="mb-4"
          >
            <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <img 
                  src={image.url} 
                  alt="Cat" 
                  className="w-full h-64 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        );
      })}
      
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {!hasMore && images.length > 0 && (
        <p className="text-center text-gray-500 p-4">
          No more images to load
        </p>
      )}
      
      {!loading && images.length === 0 && (
        <div className="w-full p-4 bg-white rounded-lg shadow">
          <p className="text-center text-gray-500">No images found</p>
        </div>
      )}
    </div>
  );
}

export default InfiniteScroll;