import React, { useState } from 'react';
import './AddCardForm.css';

const AddCardForm = ({ onAddCard }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [points, setPoints] = useState(['', '', '']);
  const [explanation, setExplanation] = useState('');
  const [metacognitionPrompt, setMetacognitionPrompt] = useState('');
  const [selfExplanationPrompt, setSelfExplanationPrompt] = useState('');
  const [cardType, setCardType] = useState('基礎概念卡');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCard = {
      front: {
        title,
        image: imageUrl,
        points: points.filter(point => point.trim() !== '')
      },
      back: {
        explanation,
        metacognitionPrompt,
        selfExplanationPrompt
      },
      cardType
    };
    onAddCard(newCard);
    // Reset form fields
    setTitle('');
    setImageUrl('');
    setPoints(['', '', '']);
    setExplanation('');
    setMetacognitionPrompt('');
    setSelfExplanationPrompt('');
    setCardType('基礎概念卡');
  };

  return (
    <form onSubmit={handleSubmit} className="add-card-form">
      <h2>添加新卡片</h2>
      
      <div className="card-type-buttons">
        <button 
          type="button" 
          className={`card-type-btn basic ${cardType === '基礎概念卡' ? 'active' : ''}`}
          onClick={() => setCardType('基礎概念卡')}
        >
          基礎概念卡
        </button>
        <button 
          type="button" 
          className={`card-type-btn advanced ${cardType === '深入解析卡' ? 'active' : ''}`}
          onClick={() => setCardType('深入解析卡')}
        >
          深入解析卡
        </button>
        <button 
          type="button" 
          className={`card-type-btn integration ${cardType === '關聯整合卡' ? 'active' : ''}`}
          onClick={() => setCardType('關聯整合卡')}
        >
          關聯整合卡
        </button>
      </div>

      <input
        type="text"
        placeholder="標題"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="圖片 URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      {points.map((point, index) => (
        <input
          key={index}
          type="text"
          placeholder={`要點 ${index + 1}`}
          value={point}
          onChange={(e) => {
            const newPoints = [...points];
            newPoints[index] = e.target.value;
            setPoints(newPoints);
          }}
        />
      ))}
      <textarea
        placeholder="解釋"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="認知提示"
        value={metacognitionPrompt}
        onChange={(e) => setMetacognitionPrompt(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="自我解釋提示"
        value={selfExplanationPrompt}
        onChange={(e) => setSelfExplanationPrompt(e.target.value)}
        required
      />
      <button type="submit">添加卡片</button>
    </form>
  );
};

export default AddCardForm;