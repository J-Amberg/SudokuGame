import { useEffect, useState } from 'react'
import './SudokuSolver.css'
import { sudokus9x9, sudokus16x16 } from './sudokus'

export default function SudokuSolver() {
  //0 stands for empty

  const sudoku = sudokus9x9[0];
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
    //add code for check legal sudoku
  }, [sudokuObject])

  const SUDOKU_SIZE = sudoku.length * sudoku.length //would be 81 for a 9x9 sudoku
  const SUDOKU_ROW_SIZE = sudoku.length //would be 9 for a 9x9 sudoku
  const SUBSECTION_ROW_SIZE = Math.sqrt(SUDOKU_ROW_SIZE) // would be 3 for a 9x9 sudoku
  const TILE_SIZE_IN_PIXELS = 50

  //return n arrays that contain numbers [1 through SUDOKU_ROW_SIZE] each
  let nFilledArrays = () => {
    let res = []
    for(let i = 0; i < SUDOKU_ROW_SIZE; i++){
      res.push([])
      for(let j = 1; j <= SUDOKU_ROW_SIZE; j++){
        res[i].push(j)
      }
    }
    return res
  }
  let listPerRow = nFilledArrays()

  let listPerColumn = nFilledArrays()
  
  let listPerSubsection = nFilledArrays()

  const getRow = (index) => Math.floor(index / SUDOKU_ROW_SIZE)
  const getColumn = (index) => index % SUDOKU_ROW_SIZE
  const getSubsection = (row, column) => Math.floor(row / SUBSECTION_ROW_SIZE) * SUBSECTION_ROW_SIZE + Math.floor(column / SUBSECTION_ROW_SIZE)
  //check if it's a legal move
  const isLegalByRow = (row, value) => listPerRow[row].includes(value)
  const isLegalByColumn = (column, value) => listPerColumn[column].includes(value)
  const isLegalBySubsection = (subsection, value) => listPerSubsection[subsection].includes(value)
  //check legal by subsection, row, and column
  const isLegal = (row, column, subsection, value ) => {
    return isLegalBySubsection(subsection, value) && 
    isLegalByRow(row, value) && isLegalByColumn(column, value)
  }
  
  const bisect = (array, value, start, end) => {
    if(!array)
      return -1
    if(end - start < 2){
      if(array[start] <= value)
        return start
      else
        return end
    }
    let middle = Math.floor((start + end) / 2)
    if(array[middle] < value)
      return bisect(array, value, middle, end)
    else 
      return bisect(array, value, start, middle)
  }

  useEffect(() => {
    if(sudokuObject)
      initializeArrays();
  }, [sudokuObject])

  const initializeArrays = () => {
    for(let i = 0; i < SUDOKU_SIZE; i++){
      let row = getRow(i)
      let column = getColumn(i);
      let currentTile = sudokuObject[row][column]
      //which [3x3] square are we in? (for a 9x9 sudoku)
      if(currentTile.predetermined){
        let subsection = getSubsection(row, column)
        let currentRow = listPerRow[row]
        let currentColumn = listPerColumn[column]
        let currentSubsection = listPerSubsection[subsection]
        let rowIndex = currentRow.indexOf(currentTile.value)
        let columnIndex = currentColumn.indexOf(currentTile.value)
        let subsectionIndex = currentSubsection.indexOf(currentTile.value)
        if(rowIndex !== -1)
          listPerRow[row].splice(listPerRow[row].indexOf(currentTile.value), 1)
        if(columnIndex !== -1)
          listPerColumn[column].splice(listPerColumn[column].indexOf(currentTile.value), 1)
        if(subsectionIndex !== -1)
          listPerSubsection[subsection].splice(listPerSubsection[subsection].indexOf(currentTile.value), 1)
      }
    }
  }

  //when a tile is changed, remove that number from the arrays
  const spliceArrays = (row, column, subsection, value) => {
    if(row.includes(value))
      row.splice(row.indexOf(value), 1)
    if(column.includes(value))
      column.splice(column.indexOf(value), 1)
    if(subsection.includes(value))
      subsection.splice(subsection.indexOf(value), 1)
  }
  //when a tile is changed, push the old value back
  //receives listPerRow[row] that needs to be modified, listPerColumn[column], etc
  const pushArrays = (legalRowNumbers, legalColumnNumbers, legalSubsectionNumbers, value) => {
    console.log(legalRowNumbers, value)
    let rowIndex = bisect(legalRowNumbers, value, 0, legalRowNumbers.length) + 1
    let columnIndex = bisect(legalColumnNumbers, value, 0, legalColumnNumbers.length) + 1
    let subsectionIndex = bisect(legalSubsectionNumbers, value, 0, legalSubsectionNumbers.length) + 1
    legalRowNumbers.splice(rowIndex, 0, value) //insert value at rowIndex, removing 0 elements
    legalColumnNumbers.splice(columnIndex, 0, value)
    legalSubsectionNumbers.splice(subsectionIndex, 0, value)
    console.log(legalRowNumbers)
  }
  const autoSolveSudoku = () => {
    /* the algorithm: 
      iterate through each tile of the sudoku, for each tile:
        starting at the number 1, try every possible number (up to 9 for a standard sudoku)
        stop at a number when it's legal and go forward to the next tile
        if(none of the possible numbers are legal):
          go back to previous tiles(again skip if predetermined),
          on previous tiles: 
           start at the number that was left there and go up to SUDOKU_ROW_SIZE
           once a legal number is found start going forward again
           if no legal number is found keep going backward
    */
    let goingForward = true;
    let tempObject = [...sudokuObject];
    let i = 0;
    let x = 0;
    while(true){
      console.log(i)
      x++
      if(x >= 100){
        console.log(tempObject)
        break;
      }
      if(i >= SUDOKU_SIZE)
        break;
      let row = getRow(i);
      let column = getColumn(i);
      let currentTile = tempObject[row][column]
      console.log(currentTile)
      if(currentTile.predetermined){
        if(goingForward)
          i++
        else
          i--
        continue
      }
      let subsection = getSubsection(row, column)
      let availableRowNumbers = listPerRow[row]
      let availableColumnNumbers = listPerColumn[column]
      let availableSubsectionNumbers = listPerSubsection[subsection]
      //j needs to start at the index of the previous number that was in the box
      for(let j = 0; j < availableRowNumbers.length; j++){
        let currentNumber = availableRowNumbers[j]
        if(isLegal(row, column, subsection, currentNumber)){
          if(currentTile.value !== 0){
            console.log('here')
            console.log(availableRowNumbers, availableColumnNumbers, availableSubsectionNumbers)
            pushArrays(availableRowNumbers, availableColumnNumbers, availableSubsectionNumbers, currentTile.value)
          }
          spliceArrays(availableRowNumbers, availableColumnNumbers, availableSubsectionNumbers, currentNumber)
          tempObject[row][column].value = currentNumber
          tempObject[row][column].index = j + 1;
          goingForward = true;
          break
        }
        else if(j === availableRowNumbers.length - 1){
          goingForward = false;
          tempObject[row][column].value = 0;
        }
      }
      if(goingForward){
        i++
      }
      else
        i--
      /*
      for(let j = tempObject[i].value; j <= SUDOKU_ROW_SIZE; j++){
        if(j === 0){
          continue;
        }
        if(!goingForward && tempObject[i].value === SUDOKU_ROW_SIZE){
          tempObject[i].value = 0;
          break;
        }
        if(isLegal(j, i, tempObject)){
          tempObject[i].value = j;
          goingForward = true;
          break;
        }
        if(j === SUDOKU_ROW_SIZE){
          tempObject[i].value = 0;
          goingForward = false;
        }
       
      }
      if(!goingForward)
        i--
      else
        i++*/
    }
    console.log(tempObject)
    setSudokuObject(tempObject)
  }


  const pixelsOffset = (index) => index * TILE_SIZE_IN_PIXELS + Math.floor(index / SUBSECTION_ROW_SIZE ) * 20
  return <div style={{top:'50px', left:'50px', position:'relative'}}>
    {sudokuObject.map((row, rowIndex) => {
      return row.map((tile, index) => {
        return <div className="tile" key={index} style={{top: pixelsOffset(rowIndex), left: pixelsOffset(index), color: tile.predetermined && 'blueviolet'}}>
        {tile.value !== 0 ? tile.value : " "}
      </div> 
      })
    })}
    <button id='solvebutton' onClick={autoSolveSudoku}>Auto Solve</button>
    {!legalSudoku && <div id='legalMessage'>illegal sudoku</div>}
  </div>
}

