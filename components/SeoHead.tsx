import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description?: string;
}

const SeoHead: React.FC<SeoHeadProps> = ({ title, description }) => {
  useEffect(() => {
    // Update Title
    const brandSuffix = ' | Intimacy Wellness Morocco';
    if (title.includes('|')) {
      document.title = title;
    } else {
      document.title = `${title}${brandSuffix}`;
    }

    // Update Meta Description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
    // Update Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    // Default to current URL without query params if not provided
    const canonicalUrl = window.location.href.split('?')[0];
    linkCanonical.setAttribute('href', canonicalUrl);

  }, [title, description]);

  return null;
};

export default SeoHead;