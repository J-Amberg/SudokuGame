import { useEffect, useState } from 'react'
import './SudokuSolver.css'
import { sudokus9x9, sudokus16x16 } from './sudokus'

export default function SudokuSolver() {
  //0 stands for empty
  const sudoku = sudokus16x16[0];
  

  const [sudokuObject, setSudokuObject] = useState(sudoku.map(tile => {
    return {
      value: tile,
      predetermined: tile !== 0 ? true : false
    }
  }))
  const sudokuSize = Math.sqrt(sudoku.length)
  const subsectionSize = Math.sqrt(sudokuSize)
  const tileSizeInPixels = 70;

  const pixelsFromTop = (index) => {
    const subsectionBuffer = Math.floor((index / sudokuSize) / subsectionSize) * 20
    return ((Math.floor(index / sudokuSize)) * tileSizeInPixels) + subsectionBuffer
  }

  const pixelsFromLeft = (index) => {
    const subsectionBuffer = Math.floor((index % sudokuSize) / subsectionSize) * 20; 
    return ((index % sudokuSize) * tileSizeInPixels) + subsectionBuffer
  }

  const isLegalByRow = (testNum, index, sudokuObject) => {
    //get the row number (possible values: 0 through sudokuSize)
    const rowNum = Math.floor(index / sudokuSize)
    for(let i = 0; i < sudokuSize; i++){
      if(sudokuObject[i + (rowNum * sudokuSize)].value === testNum)
        return false
    }
    return true
  }

  const isLegalByColumn = (testNum, index, sudokuObject) => {
    //get the column number (possible values: 0 through sudokuSize)
    const columnNum = (index) % (sudokuSize)
    for(let i = 0; i < sudokuSize; i++){
      if(sudokuObject[(i * sudokuSize) + columnNum].value === testNum)
        return false;
    }
    return true;
  }

  const isLegalBySubsection = (testNum, index, sudokuObject) => {
    const subsectionSize = Math.sqrt(sudokuSize)
    const rowNum = Math.floor(index / sudokuSize)
    const columnNum = index % sudokuSize 
    //gets 'subsection indexes', for instance in a 9x9 grid there's 9 subsections (3x3) boxes
    //this determines which box to check
    const subsectionRow = Math.floor(rowNum / Math.sqrt(sudokuSize))
    const subsectionColumn = Math.floor(columnNum / Math.sqrt(sudokuSize))
    //example: box [1, 1] should check indexes: 30, 31, 32, 39, 40, 41, 48, 49, 50
    const subsectionRowSize = subsectionSize * sudokuSize
    const startingIndex = subsectionRowSize * subsectionRow + (subsectionColumn * subsectionSize)
    for(let i = 0; i < subsectionSize; i++){
      for(let j = 0; j < subsectionSize; j++){
        if(sudokuObject[(startingIndex + j) + i * sudokuSize].value === testNum)
          return false
      }
    }
    return true
  }
  
  const isLegal = (testNum, index, tempObject) => {
    return(isLegalBySubsection(testNum, index, tempObject) && 
    isLegalByRow(testNum, index, tempObject) && isLegalByColumn(testNum, index, tempObject))
  }
  
  const autoSolveSudoku = () => {
    /* the algorithm: 
      iterate through each tile of the sudoku, for each tile:
        starting at the number 1, try every possible number (up to 9 for a standard sudoku)
        stop at a number when it's legal and go forward to the next tile
        if(none of the possible numbers are legal):
          go back to previous tiles(again skip if predetermined),
          on previous tiles: 
           start at the number that was left there and go up to sudokuSize
           once a legal number is found start going forward again
           if no legal number is found keep going backward
    */
    let goingForward = true;
    let tempObject = [...sudokuObject];
    for(let i = 0; i < tempObject.length; i++){
      if(tempObject[i].predetermined){
        if(goingForward)
          continue;
        i -=2;
        continue;
      }
      for(let j = tempObject[i].value; j <= sudokuSize; j++){
        if(j === 0){
          continue;
        }
        if(!goingForward && tempObject[i].value === sudokuSize){
          tempObject[i].value = 0;
          break;
        }
        if(isLegal(j, i, tempObject)){
          tempObject[i].value = j;
          goingForward = true;
          break;
        }
        if(j === sudokuSize){
          tempObject[i].value = 0;
          goingForward = false;
        }
       
      }
      if(!goingForward)
        i -= 2
        setSudokuObject(tempObject)
    }
    
  }
  
  return <div style={{top:'50px', left:'50px', position:'relative'}}>
    {sudokuObject.map((tile, index) => {
      return <div class="tile" style={{top: pixelsFromTop(index), left: pixelsFromLeft(index), color: tile.predetermined && 'blueviolet'}}>
        {index - 1 % sudokuSize === 0 && index !== 1&& <br/>}
        {tile.value !== 0 ? tile.value : " "}
      </div> 
    })}
    <button id='solvebutton' onClick={autoSolveSudoku}>Auto Solve</button>
  </div>
}
