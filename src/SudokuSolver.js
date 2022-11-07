import { useEffect, useState } from 'react'
import './SudokuSolver.css'
import { sudokus9x9, sudokus16x16 } from './sudokus'

export default function SudokuSolver() {
  //0 stands for empty
  const sudoku = sudokus16x16[0];
  console.log(sudoku)
  const [sudokuObject, setSudokuObject] = useState(sudoku.map(row => {
    return row.map(tile => {
      return {
        value: tile,
        predetermined: tile !== 0 ? true : false
      }
    })
  }))
  //check if the imported sudoku is legal
  const [legalSudoku, setLegalSudoku] = useState(true);
  useEffect(() => {
    if(!sudokuObject)
      return
    for(let i = 0; i < sudokuObject.length; i++){
      if(sudokuObject[i].value !== 0 && !isLegal(sudokuObject[i].value, i, sudokuObject, true)){ 
        setLegalSudoku(false);
      }
    }
  }, [sudokuObject])

  
  const sudokuRowSize = sudoku.length
  const subsectionSize = Math.sqrt(sudokuRowSize)
  const subsectionRowSize = subsectionSize * sudokuRowSize
  const tileSizeInPixels = 50;

  //return n arrays that contain numbers 1 - sudokuRowSize in an array
  let nFilledArrays = () => {
    let res = []
    for(let i = 0; i < sudokuRowSize; i++){
      res.push([])
      for(let j = 1; j <= sudokuRowSize; j++){
        res[i].push(j)
      }
    }
    return res
  }
  let listPerRow = nFilledArrays()

  let listPerColumn = nFilledArrays()
  
  let listPerSubsection = nFilledArrays()


  const isLegalByRow = (testNum, index, sudokuObject, predetermined) => {
    //get the row number (possible values: 0 through sudokuRowSize)
    const rowNum = Math.floor(index / sudokuRowSize)
    for(let i = 0; i < sudokuRowSize; i++){
      let currIndex = i + (rowNum * sudokuRowSize)
      if(currIndex === index && predetermined)
        continue;
      if(sudokuObject[currIndex].value === testNum)
        return false
    }
    return true
  }

  const isLegalByColumn = (testNum, index, sudokuObject, predetermined) => {
    //get the column number (possible values: 0 through sudokuRowSize)
    const columnNum = (index) % (sudokuRowSize)
    for(let i = 0; i < sudokuRowSize; i++){
      let currIndex = (i * sudokuRowSize) + columnNum;
      if(currIndex === index && predetermined)
        continue;
      if(sudokuObject[(i * sudokuRowSize) + columnNum].value === testNum)
        return false;
    }
    return true;
  }

  const isLegalBySubsection = (testNum, index, sudokuObject, predetermined) => {
    const rowNum = Math.floor(index / sudokuRowSize)
    const columnNum = index % sudokuRowSize 
    //gets 'subsection indexes', for instance in a 9x9 grid there's 9 subsections (3x3) boxes
    //this determines which box to check
    const subsectionRow = Math.floor(rowNum / Math.sqrt(sudokuRowSize))
    const subsectionColumn = Math.floor(columnNum / Math.sqrt(sudokuRowSize))
    //example: box [1, 1] should check indexes: 30, 31, 32, 39, 40, 41, 48, 49, 50
    const startingIndex = subsectionRowSize * subsectionRow + (subsectionColumn * subsectionSize)
    for(let i = 0; i < subsectionSize; i++){
      for(let j = 0; j < subsectionSize; j++){
        let currIndex = (startingIndex + j) + i * sudokuRowSize;
        if(currIndex === index && predetermined)
          continue;
        if(sudokuObject[currIndex].value === testNum)
          return false
      }
    }
    return true
  }
  //check legal by subsection, row, and column
  const isLegal = (testNum, index, tempObject, predetermined) => {
    return isLegalBySubsection(testNum, index, tempObject, predetermined) && 
    isLegalByRow(testNum, index, tempObject, predetermined) && isLegalByColumn(testNum, index, tempObject, predetermined)
  }
  
  useEffect(() => {
    if(sudokuObject)
      initializeArrays();
  }, [sudokuObject])

  const initializeArrays = () => {
    for(let i = 0; i < sudoku.length; i++){
      let row = Math.floor(i / 16);
      let column = i % 16;
      if(sudokuObject[i].predetermined){
        listPerRow[row].splice(listPerRow[row].indexOf(sudokuObject[i].value), 1)
        listPerColumn[column].splice(listPerColumn[column].indexOf(sudokuObject[i].value), 1)

      } 
    }
  }



  
  const autoSolveSudoku = () => {
    /* the algorithm: 
      iterate through each tile of the sudoku, for each tile:
        starting at the number 1, try every possible number (up to 9 for a standard sudoku)
        stop at a number when it's legal and go forward to the next tile
        if(none of the possible numbers are legal):
          go back to previous tiles(again skip if predetermined),
          on previous tiles: 
           start at the number that was left there and go up to sudokuRowSize
           once a legal number is found start going forward again
           if no legal number is found keep going backward
    */
    let goingForward = true;
    let tempObject = [...sudokuObject];
    let i = 0;
    
    while(true){
      if(i >= tempObject.length)
        break;
      if(tempObject[i].predetermined){
        if(goingForward){
          i++
          continue;
        }
        i--;
        continue;
      }
      for(let j = tempObject[i].value; j <= sudokuRowSize; j++){
        if(j === 0){
          continue;
        }
        if(!goingForward && tempObject[i].value === sudokuRowSize){
          tempObject[i].value = 0;
          break;
        }
        if(isLegal(j, i, tempObject)){
          tempObject[i].value = j;
          goingForward = true;
          break;
        }
        if(j === sudokuRowSize){
          tempObject[i].value = 0;
          goingForward = false;
        }
       
      }
      if(!goingForward)
        i--
      else
        i++
    }
    setSudokuObject(tempObject)
  }
  
  const pixelsOffset = (index) => index * tileSizeInPixels + Math.floor(index / subsectionSize ) * 20

  return <div style={{top:'50px', left:'50px', position:'relative'}}>
    {sudokuObject.map((row, rowIndex) => {
      return row.map((tile, index) => {
        return <div className="tile" key={index} style={{top: pixelsOffset(rowIndex), left: pixelsOffset(index), color: tile.predetermined && 'blueviolet'}}>
        {index + 1 === sudokuRowSize && <br/>}
        {tile.value !== 0 ? tile.value : " "}
      </div> 
      })
    })}
    <button id='solvebutton' onClick={autoSolveSudoku}>Auto Solve</button>
    {!legalSudoku && <div id='legalMessage'>illegal sudoku</div>}
  </div>
}
