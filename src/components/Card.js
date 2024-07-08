import React, { useState, memo } from "react";
import LazyLoad from "react-lazyload";
import "./Card.css";

const Card = memo(({ front, back, isFlipped, onClick, cardType }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (!front || !back) {
    return (
      <div className="card error-card">
        <p>無效的卡片數據</p>
      </div>
    );
  }

  const openImageModal = (e) => {
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  const closeImageModal = (e) => {
    e.stopPropagation();
    setIsImageModalOpen(false);
  };

  const getCardTypeClass = () => {
    switch (cardType) {
      case "基礎概念卡":
        return "basic-card";
      case "深入解析卡":
        return "advanced-card";
      case "關聯整合卡":
        return "integration-card";
      default:
        return "";
    }
  };

  return (
    <div className={`card ${isFlipped ? "flipped" : ""}`} onClick={onClick}>
      <div className="card-inner">
        <div className={`card-face card-front ${getCardTypeClass()}`}>
          <div className="card-type-label">{cardType}</div>
          <h2>{front.title || "無標題"}</h2>
          <div className="card-content">
            <div className="card-points">
              {front.points && front.points.length > 0 ? (
                <ul>
                  {front.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p>沒有要點</p>
              )}
            </div>
            {front.image && (
              <LazyLoad height={150} once>
                <div className="card-image-container">
                  <img
                    src={front.image}
                    alt={front.title || "卡片圖片"}
                    className="card-image"
                    onClick={openImageModal}
                  />
                </div>
              </LazyLoad>
            )}
          </div>
        </div>
        <div className="card-face card-back">
          <p>{back.explanation || "沒有解釋"}</p>
          <div className="prompts">
            <div className="prompt-title">認知提示:</div>
            <div className="prompt">
              <p>{back.metacognitionPrompt || "沒有認知提示"}</p>
            </div>

            <div className="prompt-title">自我解釋提示:</div>
            <div className="prompt">
              <p>{back.selfExplanationPrompt || "沒有自我解釋提示"}</p>
            </div>
          </div>
        </div>
      </div>
      {isImageModalOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <img src={front.image} alt={front.title || "卡片圖片"} />
        </div>
      )}
    </div>
  );
});

export default Card;
