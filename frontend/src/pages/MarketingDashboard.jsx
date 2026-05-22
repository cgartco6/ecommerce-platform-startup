import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getBestPostTimes } from '../utils/formatters';
import toast from 'react-hot-toast';

const MarketingDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [platform, setPlatform] = useState('facebook');
  const [generatedContent, setGeneratedContent] = useState('');
  const [bestTimes, setBestTimes] = useState([]);
  const [complianceCheck, setComplianceCheck] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchBestTimes();
    fetchSuggestions();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchBestTimes = async () => {
    try {
      const response = await api.get('/marketing/best-times?platform=facebook');
      setBestTimes(response.data.bestTimes);
    } catch (error) {
      console.error('Error fetching best times:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/marketing/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const generateContent = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/marketing/generate', {
        productId: selectedProduct,
        platform
      });
      setGeneratedContent(response.data.suggestion.content);
      setComplianceCheck(response.data.compliance);
      toast.success('Content generated successfully');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const checkCompliance = async () => {
    if (!generatedContent) return;
    
    try {
      const response = await api.post('/marketing/check-compliance', {
        content: generatedContent,
        platform
      });
      setComplianceCheck(response.data);
    } catch (error) {
      toast.error('Compliance check failed');
    }
  };

  const saveSuggestion = async () => {
    try {
      await api.post('/marketing/suggestions', {
        title: `Post for ${products.find(p => p.id == selectedProduct)?.name}`,
        content: generatedContent,
        platform
      });
      toast.success('Content saved');
      fetchSuggestions();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Marketing Dashboard</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Content Generator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">AI Content Generator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Product</label>
                <select
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="input"
                >
                  <option value="">Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input">
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
              
              <button onClick={generateContent} disabled={loading} className="btn-primary w-full">
                {loading ? 'Generating...' : 'Generate Content'}
              </button>
              
              {generatedContent && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Generated Content</label>
                    <textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      rows={4}
                      className="input"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={checkCompliance} className="btn-secondary flex-1">
                      Check Compliance
                    </button>
                    <button onClick={saveSuggestion} className="btn-primary flex-1">
                      Save Suggestion
                    </button>
                  </div>
                </>
              )}
              
              {complianceCheck && (
                <div className={`p-4 rounded-lg ${complianceCheck.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="font-semibold">Compliance Score: {complianceCheck.score}/100</p>
                  {complianceCheck.violations?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-700">Violations:</p>
                      <ul className="list-disc list-inside text-sm text-red-600">
                        {complianceCheck.violations.map((v, i) => (
                          <li key={i}>{v.word} - {v.penalty}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Best Times & Suggestions */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Best Times to Post</h2>
            <div className="space-y-2">
              {bestTimes.map((time, idx) => (
                <div key={idx} className="p-2 bg-blue-50 rounded">
                  <p className="font-medium">{time.timeString}</p>
                  <p className="text-sm text-gray-600">Predicted engagement: {(time.predictedEngagement * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Saved Suggestions</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{suggestion.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{suggestion.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{suggestion.platform}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${suggestion.complianceScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      Score: {suggestion.complianceScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
