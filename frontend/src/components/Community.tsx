import React, { useState } from 'react';
import { Search, Bell, ThumbsUp, ThumbsDown, MessageSquare, Share2, Edit3, Mic, ChevronDown, Users, Image as ImageIcon, Video, BarChart2, X, CheckCircle2, Shield, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DISCUSSIONS } from '../constants';
import { Language, Discussion, Screen } from '../types';

interface CommunityProps {
  onBack: () => void;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
  onNavigate: (screen: Screen) => void;
}

export const Community: React.FC<CommunityProps> = ({ onBack, language, onToggleLanguage, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [discussions, setDiscussions] = useState<Discussion[]>(DISCUSSIONS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create Post State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [mediaPreview, setMediaPreview] = useState<{type: 'image'|'video', url: string} | null>(null);

  const filteredDiscussions = discussions.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query)) ||
      post.author.toLowerCase().includes(query)
    );
  });

  const handleUpvote = (id: string) => {
    setDiscussions(prev => prev.map(post => {
      if (post.id === id) {
        const isUpvoting = !post.hasUpvoted;
        let likesDelta = isUpvoting ? 1 : -1;
        let downvotesDelta = 0;
        let newHasDownvoted = post.hasDownvoted;
        if (isUpvoting && post.hasDownvoted) {
          downvotesDelta = -1;
          newHasDownvoted = false;
        }
        return {
          ...post,
          hasUpvoted: isUpvoting,
          hasDownvoted: newHasDownvoted,
          likes: post.likes + likesDelta,
          downvotes: (post.downvotes || 0) + downvotesDelta
        };
      }
      return post;
    }));
  };

  const handleDownvote = (id: string) => {
    setDiscussions(prev => prev.map(post => {
      if (post.id === id) {
        const isDownvoting = !post.hasDownvoted;
        let downvotesDelta = isDownvoting ? 1 : -1;
        let likesDelta = 0;
        let newHasUpvoted = post.hasUpvoted;
        if (isDownvoting && post.hasUpvoted) {
          likesDelta = -1;
          newHasUpvoted = false;
        }
        return {
          ...post,
          hasDownvoted: isDownvoting,
          hasUpvoted: newHasUpvoted,
          downvotes: (post.downvotes || 0) + downvotesDelta,
          likes: post.likes + likesDelta
        };
      }
      return post;
    }));
  };

  const handleReport = (id: string) => {
    setDiscussions(prev => prev.map(post => {
      if (post.id === id) {
        return { ...post, isReported: true };
      }
      return post;
    }));
  };

  const handlePollVote = (postId: string, optionId: string) => {
    setDiscussions(prev => prev.map(post => {
      if (post.id === postId && post.poll && !post.poll.userVotedOption) {
        const updatedOptions = post.poll.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return {
          ...post,
          poll: {
            ...post.poll,
            options: updatedOptions,
            totalVotes: post.poll.totalVotes + 1,
            userVotedOption: optionId
          }
        };
      }
      return post;
    }));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSimulateMediaUpload = (type: 'image' | 'video') => {
    if (type === 'image') {
      setMediaPreview({ type: 'image', url: 'https://picsum.photos/seed/newpost/400/300' });
    } else {
      setMediaPreview({ type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' });
    }
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: Discussion = {
      id: Date.now().toString(),
      author: 'Current User',
      authorInitials: 'CU',
      authorReputation: 10,
      location: 'Your Farm',
      time: 'Just now',
      title: newPostTitle,
      content: newPostContent,
      tags: ['General'],
      likes: 0,
      downvotes: 0,
      comments: 0,
      hasUpvoted: false,
      hasDownvoted: false,
      isReported: false,
    };

    if (mediaPreview) {
      newPost.media = [mediaPreview];
    }

    if (showPollForm && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
      newPost.poll = {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map((opt, i) => ({
          id: `new_p_${i}`,
          text: opt,
          votes: 0
        })),
        totalVotes: 0
      };
    }

    setDiscussions([newPost, ...discussions]);
    setIsCreateModalOpen(false);
    
    // Reset form
    setNewPostTitle('');
    setNewPostContent('');
    setShowPollForm(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setMediaPreview(null);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-soil w-full">
      <header className="sticky top-0 bg-primary-dark text-white p-4 pt-10 md:pt-6 pb-6 rounded-b-[24px] md:rounded-b-none shadow-lg z-50 shrink-0 w-full transition-all">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Users size={28} />
              <div>
                <h1 className="font-bold text-xl leading-none">Community</h1>
                <p className="text-xs text-green-200 opacity-90">Peer-to-Peer Advice</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-1 flex items-center border border-green-400 relative w-24 h-8 cursor-pointer" onClick={() => onToggleLanguage()}>
              <motion.div 
                className="absolute bg-white rounded-full h-6 w-7 shadow-sm"
                animate={{ x: language === 'en' ? 0 : language === 'hi' ? 30 : 60 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
              <button className={`relative z-10 flex-1 text-[8px] font-black transition-colors ${language === 'en' ? 'text-primary-dark' : 'text-white'}`}>EN</button>
              <button className={`relative z-10 flex-1 text-[8px] font-black transition-colors ${language === 'hi' ? 'text-primary-dark' : 'text-white'}`}>HI</button>
              <button className={`relative z-10 flex-1 text-[8px] font-black transition-colors ${language === 'kn' ? 'text-primary-dark' : 'text-white'}`}>KN</button>
            </div>
            <button className="p-2 rounded-full hover:bg-primary transition">
              <Bell size={24} />
            </button>
          </div>
        </div>
        <div className="relative mt-6">
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-green-400/30 text-white placeholder-green-100/70 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:bg-white/20 focus:border-green-300 transition-colors backdrop-blur-sm" 
            placeholder="Search crops, pests, or topics..." 
            type="text"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-200" size={20} />
        </div>
        </div>
      </header>

      <main className="flex-1 pb-32 md:pb-12 pt-4 md:pt-8 w-full max-w-7xl mx-auto relative">
        {/* Scheme Finder Banner */}
        <div className="px-4 md:px-6 mb-6">
          <button 
            onClick={() => onNavigate('scheme-finder')}
            className="w-full bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-5 md:p-6 rounded-2xl shadow-lg flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <span className="text-2xl">🏛️</span>
              </div>
              <div className="text-left">
                <h3 className="text-white font-black text-lg leading-tight">Govt Schemes</h3>
                <p className="text-green-100 text-xs font-medium mt-0.5">Find subsidies & loans you qualify for</p>
              </div>
            </div>
            <div className="bg-white text-[#1B5E20] px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
              Check Now
            </div>
          </button>
        </div>

        <div className="flex overflow-x-auto gap-3 px-4 mb-6 hide-scrollbar">
          <button className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shadow-sm">All Topics</button>
          {['Disease Control', 'Fertilizers', 'Market Prices'].map((topic, i) => (
            <button key={i} className="bg-white text-earth border border-gray-200 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
              {topic}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-end px-5 md:px-6 mb-4 mt-6">
          <h2 className="text-lg md:text-xl font-bold text-earth">Top Discussions</h2>
          <button className="text-primary text-sm font-semibold flex items-center">
            Sort by: Newest <ChevronDown size={16} className="ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-6 pb-24 auto-rows-max items-start">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((post, index) => (
              <motion.article 
                key={post.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full transform-gpu hover:shadow-xl transition-all duration-300"
              >
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex gap-4 items-start">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      post.authorInitials === 'RS' ? 'bg-orange-100 text-orange-700' : 
                      post.authorInitials === 'AS' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {post.authorInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-earth text-lg leading-tight mb-1">{post.title}</h3>
                      <div className="text-xs text-gray-500 mb-2 flex items-center flex-wrap gap-x-1.5">
                        <span className="font-semibold text-gray-700">{post.author}</span>
                        {post.authorBadge && (
                          <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                            <Shield size={10} /> {post.authorBadge}
                          </span>
                        )}
                        {post.authorReputation !== undefined && (
                          <span className="text-primary font-bold">({post.authorReputation} pts)</span>
                        )}
                        <span>• {post.location} • {post.time}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap break-words">{post.content}</p>
                      
                      {/* Media Rendering */}
                      {post.media && post.media.length > 0 && (
                        <div className={`grid gap-2 mb-3 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {post.media.map((m, i) => (
                            <div key={i} className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50 aspect-video relative">
                              {m.type === 'video' ? (
                                <video src={m.url} controls className="w-full h-full object-cover" />
                              ) : (
                                <img src={m.url} alt="Post media" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Legacy Image Rendering */}
                      {!post.media && post.image && (
                        <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50 aspect-video relative mb-3">
                          <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Poll Rendering */}
                      {post.poll && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100">
                          <h4 className="font-bold text-earth text-sm mb-3 flex items-center gap-2">
                            <BarChart2 size={16} className="text-primary" />
                            {post.poll.question}
                          </h4>
                          <div className="space-y-2">
                            {post.poll.options.map((opt) => {
                              const percentage = post.poll!.totalVotes > 0 
                                ? Math.round((opt.votes / post.poll!.totalVotes) * 100) 
                                : 0;
                              const isVoted = post.poll!.userVotedOption === opt.id;
                              
                              return (
                                <button 
                                  key={opt.id}
                                  onClick={() => handlePollVote(post.id, opt.id)}
                                  disabled={!!post.poll!.userVotedOption}
                                  className={`w-full relative overflow-hidden rounded-lg border p-3 text-left transition-all ${
                                    isVoted ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary/50'
                                  }`}
                                >
                                  {post.poll!.userVotedOption && (
                                    <div 
                                      className="absolute left-0 top-0 bottom-0 bg-primary/10 transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  )}
                                  <div className="relative z-10 flex justify-between items-center">
                                    <span className={`text-sm font-medium ${isVoted ? 'text-primary-dark' : 'text-gray-700'}`}>
                                      {opt.text}
                                    </span>
                                    {post.poll!.userVotedOption && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500">{percentage}%</span>
                                        {isVoted && <CheckCircle2 size={16} className="text-primary" />}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-3 text-right">{post.poll.totalVotes} votes</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {post.tags.map((tag, i) => (
                          <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            tag === 'PestControl' || tag === 'Disease' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                          }`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm px-5 py-3 flex items-center justify-between border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-1 py-0.5">
                    <button 
                      onClick={() => handleUpvote(post.id)}
                      className={`flex items-center p-1.5 rounded-full transition-colors ${post.hasUpvoted ? 'text-primary bg-green-50' : 'text-gray-500 hover:text-primary hover:bg-gray-100'}`}
                    >
                      <ThumbsUp size={16} className={post.hasUpvoted ? 'fill-current' : ''} />
                    </button>
                    <span className="text-xs font-bold text-gray-700 min-w-[20px] text-center">{post.likes - (post.downvotes || 0)}</span>
                    <button 
                      onClick={() => handleDownvote(post.id)}
                      className={`flex items-center p-1.5 rounded-full transition-colors ${post.hasDownvoted ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'}`}
                    >
                      <ThumbsDown size={16} className={post.hasDownvoted ? 'fill-current' : ''} />
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 text-gray-600 hover:text-primary ml-1">
                    <MessageSquare size={18} />
                    <span className="text-xs font-semibold">{post.comments} <span className="hidden sm:inline">Comments</span></span>
                  </button>
                  <div className="flex items-center gap-2 ml-auto">
                    <button 
                      onClick={() => handleReport(post.id)}
                      className={`flex items-center gap-1 text-xs font-semibold transition-colors ${post.isReported ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
                      title="Report Content"
                    >
                      <Flag size={16} className={post.isReported ? 'fill-current' : ''} />
                    </button>
                    <button className="flex items-center p-1 text-gray-400 hover:text-primary">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Search className="mx-auto mb-3 opacity-50" size={32} />
              <p>No discussions found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* FAB and Voice Bar Container */}
        <div className="fixed bottom-28 md:bottom-10 right-6 flex flex-col items-end gap-3 z-50">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white rounded-full p-4 flex items-center gap-2 shadow-2xl transition-transform active:scale-95"
          >
            <Edit3 size={24} />
            <span className="font-bold pr-1 hidden md:inline">Ask Community</span>
          </button>
          
          <button 
            className="bg-earth hover:bg-earth-dark text-white rounded-full h-14 w-14 flex items-center justify-center shadow-2xl border-2 border-white/20 transition-transform active:scale-95"
          >
            <Mic size={24} />
          </button>
        </div>
      </main>

      {/* Create Post Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-lg text-earth">Create Post</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto flex-1">
                <input 
                  type="text" 
                  placeholder="Title of your discussion..."
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
                  className="w-full text-lg font-bold text-earth placeholder-gray-400 border-none focus:ring-0 p-0 mb-4"
                />
                <textarea 
                  placeholder="Share your question, experience, or advice..."
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  className="w-full text-gray-700 placeholder-gray-400 border-none focus:ring-0 p-0 min-h-[100px] resize-none"
                />

                {/* Media Preview */}
                {mediaPreview && (
                  <div className="relative mt-4 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video">
                    <button 
                      onClick={() => setMediaPreview(null)}
                      className="absolute top-2 right-2 z-10 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                    >
                      <X size={16} />
                    </button>
                    {mediaPreview.type === 'video' ? (
                      <video src={mediaPreview.url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={mediaPreview.url} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}

                {/* Poll Form */}
                {showPollForm && (
                  <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                        <BarChart2 size={16} /> Create Poll
                      </h3>
                      <button onClick={() => setShowPollForm(false)} className="text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ask a question..."
                      value={pollQuestion}
                      onChange={e => setPollQuestion(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400"
                    />
                    <div className="space-y-2">
                      {pollOptions.map((opt, i) => (
                        <input 
                          key={i}
                          type="text" 
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={e => handlePollOptionChange(i, e.target.value)}
                          className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        />
                      ))}
                    </div>
                    {pollOptions.length < 4 && (
                      <button 
                        onClick={handleAddPollOption}
                        className="text-blue-600 text-sm font-medium mt-3 hover:underline"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSimulateMediaUpload('image')}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-green-50 rounded-full transition-colors"
                      title="Add Image"
                    >
                      <ImageIcon size={22} />
                    </button>
                    <button 
                      onClick={() => handleSimulateMediaUpload('video')}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-green-50 rounded-full transition-colors"
                      title="Add Video"
                    >
                      <Video size={22} />
                    </button>
                    <button 
                      onClick={() => setShowPollForm(!showPollForm)}
                      className={`p-2 rounded-full transition-colors ${showPollForm ? 'text-primary bg-green-50' : 'text-gray-500 hover:text-primary hover:bg-green-50'}`}
                      title="Add Poll"
                    >
                      <BarChart2 size={22} />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleCreatePost}
                  disabled={!newPostTitle.trim() || !newPostContent.trim()}
                  className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Post Discussion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

