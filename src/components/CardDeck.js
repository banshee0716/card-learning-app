import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useFlashcards } from "../FlashcardContext";
import Card from "./Card";
import AddCardForm from "./AddCardForm";
import "./CardDeck.css";

const CardDeck = () => {
  const { cards, currentTopic, addCard, deleteCard } = useFlashcards();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const cardDeckRef = useRef(null);

  const currentCards = useMemo(
    () => cards[currentTopic] || [],
    [cards, currentTopic]
  );

  const resetDeck = useCallback(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setDirection(null);
    setIsImageModalOpen(false);
  }, []);

  useEffect(() => {
    resetDeck();
  }, [currentTopic, currentCards, resetDeck]);

  const getCardType = (card) => {
    return card.cardType || "基礎概念卡";
  };

  const nextCard = useCallback(() => {
    if (currentCards.length > 0 && !isAnimating) {
      setIsAnimating(true);
      setDirection("left");
      setTimeout(() => {
        setCurrentCardIndex(
          (prevIndex) => (prevIndex + 1) % currentCards.length
        );
        setIsFlipped(false);
        setIsImageModalOpen(false);
        setTimeout(() => {
          setIsAnimating(false);
          setDirection(null);
        }, 50);
      }, 300);
    }
  }, [currentCards, isAnimating]);

  const prevCard = useCallback(() => {
    if (currentCards.length > 0 && !isAnimating) {
      setIsAnimating(true);
      setDirection("right");
      setTimeout(() => {
        setCurrentCardIndex(
          (prevIndex) =>
            (prevIndex - 1 + currentCards.length) % currentCards.length
        );
        setIsFlipped(false);
        setIsImageModalOpen(false);
        setTimeout(() => {
          setIsAnimating(false);
          setDirection(null);
        }, 50);
      }, 300);
    }
  }, [currentCards, isAnimating]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      if (prev) {
        setIsImageModalOpen(false); // 翻回正面時關閉圖片模態框
      }
      return !prev;
    });
  }, []);

  const toggleImageModal = useCallback(() => {
    if (!isFlipped) {
      setIsImageModalOpen((prev) => !prev);
    }
  }, [isFlipped]);

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowLeft":
          prevCard();
          break;
        case "ArrowRight":
          nextCard();
          break;
        case "ArrowUp":
        case "ArrowDown":
          toggleFlip();
          break;
        case " ":
          event.preventDefault();
          toggleImageModal();
          break;
        default:
          break;
      }
    },
    [prevCard, nextCard, toggleFlip, toggleImageModal]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleDelete = useCallback(() => {
    if (currentCards.length === 0) return;

    if (window.confirm("確定要刪除這張卡片嗎？")) {
      deleteCard(currentTopic, currentCardIndex);
      if (currentCardIndex === currentCards.length - 1) {
        setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
      }
    }
  }, [currentCards, currentTopic, currentCardIndex, deleteCard]);

  const handleAddCard = useCallback(
    (newCard) => {
      addCard(currentTopic, newCard);
      setShowAddForm(false);
    },
    [addCard, currentTopic]
  );

  const handleDragStart = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.touches ? e.touches[0].clientX : e.clientX);
    setCurrentX(0);
  }, []);

  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const diff = x - startX;
      setCurrentX(diff);
    },
    [isDragging, startX]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (currentX > 50) {
      prevCard();
    } else if (currentX < -50) {
      nextCard();
    }
    setCurrentX(0);
  }, [currentX, prevCard, nextCard]);

  useEffect(() => {
    const cardDeck = cardDeckRef.current;
    if (cardDeck) {
      cardDeck.addEventListener("touchstart", handleDragStart);
      cardDeck.addEventListener("touchmove", handleDragMove);
      cardDeck.addEventListener("touchend", handleDragEnd);
      cardDeck.addEventListener("mousedown", handleDragStart);
      cardDeck.addEventListener("mousemove", handleDragMove);
      cardDeck.addEventListener("mouseup", handleDragEnd);
      cardDeck.addEventListener("mouseleave", handleDragEnd);

      return () => {
        cardDeck.removeEventListener("touchstart", handleDragStart);
        cardDeck.removeEventListener("touchmove", handleDragMove);
        cardDeck.removeEventListener("touchend", handleDragEnd);
        cardDeck.removeEventListener("mousedown", handleDragStart);
        cardDeck.removeEventListener("mousemove", handleDragMove);
        cardDeck.removeEventListener("mouseup", handleDragEnd);
        cardDeck.removeEventListener("mouseleave", handleDragEnd);
      };
    }
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  const renderCard = (cardData, isCurrentCard) => (
    <Card
      front={cardData.front}
      back={cardData.back}
      isFlipped={isCurrentCard ? isFlipped : false}
      onClick={isCurrentCard ? toggleFlip : () => {}}
      cardType={getCardType(cardData)}
      isImageModalOpen={isCurrentCard ? isImageModalOpen : false}
      setIsImageModalOpen={setIsImageModalOpen}
      isCurrent={isCurrentCard}
      toggleImageModal={toggleImageModal}
    />
  );

  if (currentCards.length === 0) {
    return (
      <div className="card-deck-container">
        <div className="no-cards">沒有卡片，請添加新卡片。</div>
        <div className="button-group">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="action-btn"
          >
            {showAddForm ? "隱藏表單" : "新增新卡片"}
          </button>
        </div>
        {showAddForm && <AddCardForm onAddCard={handleAddCard} />}
      </div>
    );
  }

  const currentCard = currentCards[currentCardIndex];
  const prevCardData =
    currentCardIndex > 0 ? currentCards[currentCardIndex - 1] : null;
  const nextCardData =
    currentCardIndex < currentCards.length - 1
      ? currentCards[currentCardIndex + 1]
      : null;

  return (
    <div className="card-deck-container">
      <div
        ref={cardDeckRef}
        className={`card-deck ${direction}`}
        style={{
          transform: `translateX(${currentX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
      >
        {prevCardData && (
          <div className="card-wrapper prev-card">
            {renderCard(prevCardData, false)}
          </div>
        )}
        <div className="card-wrapper current-card">
          {currentCard ? (
            renderCard(currentCard, true)
          ) : (
            <div className="error-card">無效的卡片數據</div>
          )}
        </div>
        {nextCardData && (
          <div className="card-wrapper next-card">
            {renderCard(nextCardData, false)}
          </div>
        )}
      </div>
      <div className="navigation">
        <button
          onClick={prevCard}
          className="nav-button prev"
          aria-label="上一張卡片"
          disabled={currentCards.length <= 1 || isAnimating}
        >
          &#8249;
        </button>
        <div className="card-count">
          {currentCardIndex + 1} / {currentCards.length}
        </div>
        <button
          onClick={nextCard}
          className="nav-button next"
          aria-label="下一張卡片"
          disabled={currentCards.length <= 1 || isAnimating}
        >
          &#8250;
        </button>
        {/*
        <button
          onClick={handleDelete}
          className="nav-button delete"
          aria-label="刪除卡片"
          disabled={currentCards.length === 0}
        >
          &#128465;
        </button>*/}
      </div>
      {/*
      <div className="button-group">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="action-btn"
        >
          {showAddForm ? "隱藏表單" : "新增新卡片"}
        </button>
      </div>*/}
      {showAddForm && <AddCardForm onAddCard={handleAddCard} />}
      <div className="keyboard-instructions">
        <span>使用鍵盤及滑鼠操作：</span>
        <br />
        <span>切換卡片：滑鼠點擊下方標示，或鍵盤← →，或左右拖曳卡片</span>
        <br />
        <span>翻轉卡片：滑鼠點擊卡片，或鍵盤↑ ↓</span>
        <br />
        <span>開啟/關閉圖片（僅限卡片正面）：點擊圖片或按空白鍵</span>
      </div>
    </div>
  );
};

export default CardDeck;

/*import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useFlashcards } from "../FlashcardContext";
import Card from "./Card";
import AddCardForm from "./AddCardForm";
import "./CardDeck.css";

const CardDeck = () => {
  const { cards, currentTopic, addCard, deleteCard } = useFlashcards();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const cardDeckRef = useRef(null);

  const currentCards = useMemo(
    () => cards[currentTopic] || [],
    [cards, currentTopic]
  );

  const resetDeck = useCallback(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setDirection(null);
  }, []);

  useEffect(() => {
    resetDeck();
  }, [currentTopic, currentCards, resetDeck]);

  // 新的 getCardType 函數
  const getCardType = (card) => {
    return card.cardType || "基礎概念卡"; // 如果沒有指定類型，默認為基礎概念卡
  };

  const nextCard = useCallback(() => {
    if (currentCards.length > 0 && !isAnimating) {
      setIsAnimating(true);
      setDirection("left");
      setTimeout(() => {
        setCurrentCardIndex(
          (prevIndex) => (prevIndex + 1) % currentCards.length
        );
        setIsFlipped(false);
        setTimeout(() => {
          setIsAnimating(false);
          setDirection(null);
        }, 50);
      }, 300);
    }
  }, [currentCards, isAnimating]);

  const prevCard = useCallback(() => {
    if (currentCards.length > 0 && !isAnimating) {
      setIsAnimating(true);
      setDirection("right");
      setTimeout(() => {
        setCurrentCardIndex(
          (prevIndex) =>
            (prevIndex - 1 + currentCards.length) % currentCards.length
        );
        setIsFlipped(false);
        setTimeout(() => {
          setIsAnimating(false);
          setDirection(null);
        }, 50);
      }, 300);
    }
  }, [currentCards, isAnimating]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowLeft":
          prevCard();
          break;
        case "ArrowRight":
          nextCard();
          break;
        case "ArrowUp":
        case "ArrowDown":
          toggleFlip();
          break;
        default:
          break;
      }
    },
    [prevCard, nextCard, toggleFlip]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleDelete = useCallback(() => {
    if (currentCards.length === 0) return;

    if (window.confirm("確定要刪除這張卡片嗎？")) {
      deleteCard(currentTopic, currentCardIndex);
      if (currentCardIndex === currentCards.length - 1) {
        setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
      }
    }
  }, [currentCards, currentTopic, currentCardIndex, deleteCard]);

  const handleAddCard = useCallback(
    (newCard) => {
      addCard(currentTopic, newCard);
      setShowAddForm(false);
    },
    [addCard, currentTopic]
  );

  const handleDragStart = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.touches ? e.touches[0].clientX : e.clientX);
    setCurrentX(0);
  }, []);

  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const diff = x - startX;
      setCurrentX(diff);
    },
    [isDragging, startX]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (currentX > 50) {
      prevCard();
    } else if (currentX < -50) {
      nextCard();
    }
    setCurrentX(0);
  }, [currentX, prevCard, nextCard]);

  useEffect(() => {
    const cardDeck = cardDeckRef.current;
    if (cardDeck) {
      cardDeck.addEventListener("touchstart", handleDragStart);
      cardDeck.addEventListener("touchmove", handleDragMove);
      cardDeck.addEventListener("touchend", handleDragEnd);
      cardDeck.addEventListener("mousedown", handleDragStart);
      cardDeck.addEventListener("mousemove", handleDragMove);
      cardDeck.addEventListener("mouseup", handleDragEnd);
      cardDeck.addEventListener("mouseleave", handleDragEnd);

      return () => {
        cardDeck.removeEventListener("touchstart", handleDragStart);
        cardDeck.removeEventListener("touchmove", handleDragMove);
        cardDeck.removeEventListener("touchend", handleDragEnd);
        cardDeck.removeEventListener("mousedown", handleDragStart);
        cardDeck.removeEventListener("mousemove", handleDragMove);
        cardDeck.removeEventListener("mouseup", handleDragEnd);
        cardDeck.removeEventListener("mouseleave", handleDragEnd);
      };
    }
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  if (currentCards.length === 0) {
    return (
      <div className="card-deck-container">
        <div className="no-cards">沒有卡片，請添加新卡片。</div>
        <div className="button-group">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="action-btn"
          >
            {showAddForm ? "隱藏表單" : "新增新卡片"}
          </button>
        </div>
        {showAddForm && <AddCardForm onAddCard={handleAddCard} />}
      </div>
    );
  }

  const currentCard = currentCards[currentCardIndex];
  const prevCardData =
    currentCardIndex > 0 ? currentCards[currentCardIndex - 1] : null;
  const nextCardData =
    currentCardIndex < currentCards.length - 1
      ? currentCards[currentCardIndex + 1]
      : null;

  return (
    <div className="card-deck-container">
      <div
        ref={cardDeckRef}
        className={`card-deck ${direction}`}
        style={{
          transform: `translateX(${currentX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
      >
        {prevCardData && (
          <div className="card-wrapper prev-card">
            <Card
              front={prevCardData.front}
              back={prevCardData.back}
              isFlipped={false}
              onClick={() => {}}
              cardType={getCardType(prevCardData)}
            />
          </div>
        )}
        <div className="card-wrapper current-card">
          {currentCard ? (
            <Card
              front={currentCard.front}
              back={currentCard.back}
              isFlipped={isFlipped}
              onClick={toggleFlip}
              cardType={getCardType(currentCard)}
            />
          ) : (
            <div className="error-card">無效的卡片數據</div>
          )}
        </div>
        {nextCardData && (
          <div className="card-wrapper next-card">
            <Card
              front={nextCardData.front}
              back={nextCardData.back}
              isFlipped={false}
              onClick={() => {}}
              cardType={getCardType(nextCardData)}
            />
          </div>
        )}
      </div>
      <div className="navigation">
        <button
          onClick={prevCard}
          className="nav-button prev"
          aria-label="上一張卡片"
          disabled={currentCards.length <= 1 || isAnimating}
        >
          &#8249;
        </button>
        <div className="card-count">
          {currentCardIndex + 1} / {currentCards.length}
        </div>
        <button
          onClick={nextCard}
          className="nav-button next"
          aria-label="下一張卡片"
          disabled={currentCards.length <= 1 || isAnimating}
        >
          &#8250;
        </button>
        <button
          onClick={handleDelete}
          className="nav-button delete"
          aria-label="刪除卡片"
          disabled={currentCards.length === 0}
        >
          &#128465;
        </button>
      </div>
      <div className="button-group">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="action-btn"
        >
          {showAddForm ? "隱藏表單" : "新增新卡片"}
        </button>
      </div>
      {showAddForm && <AddCardForm onAddCard={handleAddCard} />}
      <div className="keyboard-instructions">
        <span>使用鍵盤及滑鼠操作：</span>
        <br />
        <span>切換卡片：滑鼠點擊下方標示，或鍵盤← →，或左右拖曳卡片</span>
        <br />
        <span>翻轉卡片：滑鼠點擊卡片，或鍵盤↑ ↓</span>
      </div>
    </div>
  );
};

export default CardDeck;

*/
