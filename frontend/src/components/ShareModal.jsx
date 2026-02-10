import { useState, useEffect } from 'react';
import { API, API_URL } from '../api';

function ShareModal({ noteId, onClose }) {
  const [shareUrl, setShareUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateShareLink();
  }, [noteId]);

  const generateShareLink = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.generateShareLink(token, noteId);
      const data = await res.json();
      
      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
        fetchQrCode(data.shareLink);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCode = async (shareLink) => {
    try {
      const res = await fetch(`${API_URL}/api/notes/qr/${shareLink}`);
      const data = await res.json();
      setQrCode(data.qrCode);
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Share Note</h2>
        
        {loading ? (
          <div className="loading">Generating share link...</div>
        ) : (
          <>
            <div className="share-link-section">
              <label>Share Link:</label>
              <div className="share-link-input">
                <input type="text" value={shareUrl} readOnly />
                <button onClick={copyToClipboard} className="btn-copy">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="qr-section">
              <label>QR Code:</label>
              <p className="qr-description">Scan to view this note</p>
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="qr-image" />
              ) : (
                <div className="qr-placeholder">Loading QR code...</div>
              )}
            </div>

            <div className="share-actions">
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-open">
                Open Share Page
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ShareModal;
