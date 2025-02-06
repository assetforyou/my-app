import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Mail, X } from 'lucide-react';
import html2canvas from 'html2canvas';

const ShareSummary = () => {
  const [isOpen, setIsOpen] = useState(false);

  const captureAndShare = async (platform) => {
    try {
      const summaryElement = document.querySelector('.summary-container');
      if (!summaryElement) return;

      const canvas = await html2canvas(summaryElement);
      const imageData = canvas.toDataURL('image/png');

      // Prepare share text
      const shareText = 'Check out my asset summary from Vault Knight!';
      const shareUrl = window.location.href;

      // Handle different platforms
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent('My Asset Summary')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
          break;
        default:
          break;
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error capturing or sharing:', error);
    }
  };

  return (
    <div className="fixed right-4 top-24 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          <Share2 size={20} />
        </button>

        {isOpen && (
          <div className="absolute right-12 top-0 bg-white rounded-lg shadow-lg p-4 w-48">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => captureAndShare('twitter')}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-500"
              >
                <Twitter size={20} />
                <span>Twitter</span>
              </button>
              
              <button
                onClick={() => captureAndShare('facebook')}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <Facebook size={20} />
                <span>Facebook</span>
              </button>
              
              <button
                onClick={() => captureAndShare('email')}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <Mail size={20} />
                <span>Email</span>
              </button>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareSummary;