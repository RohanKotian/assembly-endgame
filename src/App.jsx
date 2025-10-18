import { useState,useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { languages } from './Languages'
import { getFarewellText, getRandomWord } from './utils'
import Confetti from "react-confetti"
import Snowfall from 'react-snowfall'

export default function AssemblyEndgame(){  
  // State Values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord()); 
  const [guessedLetters, setGuessedLetters] = useState([]) 
  
  // Derived Values
  const numGuesses = languages.length - 1 
  const wrongGuessCount = 
    guessedLetters.filter(letter => !currentWord.includes(letter)).length
  const isGameWon = 
    currentWord.split("").every(letter => guessedLetters.includes(letter))
  const isGameLost = wrongGuessCount>=numGuesses
  const isGameOver = isGameWon || isGameLost
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
  const isLastGuessedIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)
  
  // Static Values
  const alphabet = "abcdefghijklmnopqrstuvwxyz"

  const buttonRef = useRef(null);

  useEffect(()=>{
    buttonRef.current.focus();
  }, [isGameOver])


  function addGuessedLetter(letter){
    setGuessedLetters(prevLetter => 
      prevLetter.includes(letter) ? prevLetter : [...prevLetter, letter]    
    )
  }
   
  function startNewGame(){
    setCurrentWord(getRandomWord());
    setGuessedLetters([]);
  }

  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    )
    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : " "}
      </span>
  )}
  )
  
  const languageElements = languages.map((lang, index)=> {
    const isLanguageLost = index < wrongGuessCount
    const styles = {
      backgroundColor: lang.backgroundColor, 
      color: lang.color
    }
    const className = clsx("chip", isLanguageLost && "lost")
    return(
      <span className={className} style={styles} key={lang.name}> 
        {lang.name} 
      </span>
    )
  })

  const keyboardElements = alphabet.split("").map(letter => {
    const isGuessed = guessedLetters.includes(letter)
    const isCorrect = isGuessed && currentWord.includes(letter)
    const isWrong = isGuessed && !currentWord.includes(letter)

    const className = clsx({
      correct: isCorrect,
      wrong: isWrong
    })
    return (
      <button 
        key={letter} 
        className={className}  
        disabled={isGameOver} 
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
        onClick={() => addGuessedLetter(letter)}
      >
        {letter.toUpperCase()}
      </button>
    )
})  

  const gameStatusClass = clsx("game-status",{
    "won" : isGameWon, 
    "lost": isGameLost,
    "farewell": !isGameOver && isLastGuessedIncorrect
  })

  function numGuessesLeft(){
    const guesses = numGuesses - wrongGuessCount;
    return(
      <h3>Number of attempts left: {guesses}</h3>              
    )
  }

  function renderGameStatus(){
    if(!isGameOver && isLastGuessedIncorrect){           
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessCount-1].name)}
        </p>)
    }
    if(isGameWon){
      return (
        <>
          <h2>You Win!</h2>
          <p>Well done! 🎉</p>  
        </>
      )
    }
    if(isGameLost){
      return(
        <>
          <h2>Game Over!</h2>
          <p>You Lose! Better start learning Assembly 😭</p>       
        </>
      )
    }
    else{
      return null
    }
  } 

  return(
    <main>
      {isGameWon && <Confetti recycle={false} numberOfPieces={1000}/>}
      {isGameLost && <Snowfall recycle={true} snowflakeCount={100}/>}
      <header>
        <h1 className='title'>Assembly: Endgame</h1>
        <p className='instructions'>Guess the word in under 8 attempts to keep the programming world safe from Assembly</p>
      </header>

      <section 
        aria-live="polite"
        role="statue"
        className={gameStatusClass}
      >
        {renderGameStatus()}      
      </section>

      <section className='language-chips'>
        {languageElements}
      </section>

      <section className='guess-count'>
        {numGuessesLeft()}
      </section>

      <section className='word'>
        {letterElements}
      </section>

      {/* Combined visually-hidden aria-live region for status updates */}
      <section 
        aria-live="polite"
        role="statue"
        className='sr-only'
      >
        <p>
          {currentWord.includes(lastGuessedLetter) ? 
            `Correct! The letter ${lastGuessedLetter} is in the word` : 
            `Sorry! The letter ${lastGuessedLetter} is not in the word`
          }
          You have {numGuesses} attempts left.
        </p>
        <p>Current word: {currentWord.split("").map(letter => 
          guessedLetters.includes(letter) ? letter + "." : "blank.")
          .join(" ")}
        </p>
      </section>

      <section className='keyboard'>
        {keyboardElements}
      </section>
      
      <button ref={buttonRef} className='new-game' onClick={startNewGame}>
        New Game
      </button>

    </main>
  )
}