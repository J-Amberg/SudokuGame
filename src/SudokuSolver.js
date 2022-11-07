import { useEffect, useState } from 'react'
import './SudokuSolver.css'
import { sudokus9x9, sudokus16x16 } from './sudokus'

export default function SudokuSolver() {
  //0 stands for empty
  const sudoku = sudokus16x16[0];
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
  const isLegalByRow = (row, value) => listPerRow[row].contains(value)
  const isLegalByColumn = (column, value) => listPerColumn[column].contains(value)
  const isLegalBySubsection = (subsection, value) => listPerSubsection[subsection].contains(value)

  //check legal by subsection, row, and column
  const isLegal = (testNum, index, tempObject, predetermined) => {
    return isLegalBySubsection(testNum, index, tempObject, predetermined) && 
    isLegalByRow(testNum, index, tempObject, predetermined) && isLegalByColumn(testNum, index, tempObject, predetermined)
  }
  
  useEffect(() => {
    //if(sudokuObject)
      //initializeArrays();
  }, [sudokuObject])

  /*const initializeArrays = () => {
    for(let i = 0; i < SUDOKU_SIZE; i++){
      let row = getRow(i)
      let column = getColumn(i);
      let currentTile = sudokuObject[row][column]
      //which [3x3] square are we in? (for a 9x9 sudoku)
      if(currentTile.predetermined){
        let subsection = getSubsection(row, column)
        listPerRow[row].splice(listPerColumn[column].indexOf(currentTile.value), 1)
        listPerColumn[column].splice(listPerColumn[column].indexOf(currentTile.value), 1)
        listPerSubsection[subsection].splice(listPerSubsection[subsection].indexOf(currentTile.value), 1)
      }
    }
  }*/
  console.log(listPerColumn[0].splice(0, 5));
  //when a tile is changed, remove that number from the arrays
  const spliceArrays = (row, column, value) => {
    listPerRow[row].splice(listPerRow[row].indexOf(value), 1)
    listPerColumn[column].splice(listPerColumn[column].indexOf(value), 1)
    let subsection = getSubsection(row, column)
    listPerSubsection[subsection].splice(listPerSubsection[subsection].indexOf(value), 1)
  }
  //when a tile is changed, push the old value back
  //receives listPerRow[row] that needs to be modified, listPerColumn[column], etc
  const pushArrays = (legalRowNumbers, legalColumnNumbers, legalSubsectionNumbers, value) => {
    let rowIndex = bisect(legalRowNumbers, value, 0, legalRowNumbers.length)
    let columnIndex = bisect(legalColumnNumbers, value, 0, legalColumnNumbers.length)
    let subsectionIndex = bisect(legalSubsectionNumbers, value, 0, legalSubsectionNumbers.length)
    legalRowNumbers.splice(rowIndex, 0, value) //insert value at rowIndex, removing 0 elements
    legalColumnNumbers.splice(columnIndex, 0, value)
    legalSubsectionNumbers.splice(subsectionIndex, 0, value)
  }

  const bisect = (array, value, start, end) => {
    if(!array)
      return 0
    if(end - start <= 2){
      if(array[start] === value)
        return start
      return end
    }
    let middle = Math.floor((start + end) / 2)
    if(array[middle] === value)
      return middle
    if(array[middle] < value)
      return bisect(array, value, middle, end)
    else 
      return bisect(array, value, start, middle)
  }

  const findSmallestArray = (array1, array2, array3) => {
    let arrayOneLength = array1.length
    let arrayTwoLength = array2.length
    let arrayThreeLength = array3.length
    if(arrayOneLength <= arrayTwoLength && arrayOneLength <= arrayThreeLength)
      return array1
    else if(arrayTwoLength <= arrayOneLength && arrayTwoLength <= arrayThreeLength)
      return array2
    else
      return array3
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
    
    
    /*while(true){
      if(i >= SUDOKU_SIZE)
        break;
      let row = getRow(i);
      let column = getColumn(i);
      let currentTile = tempObject[row][column]
      if(currentTile.predetermined){
        if(goingForward)
          i++
        else
          i--
        continue
      }
      let subsection = getSubsection(i)
      let availableRowNumbers = listPerRow[row]
      let availableColumnNumbers = listPerColumn[column]
      let availableSubsectionNumbers = listPerSubsection[subsection]
      console.log(availableRowNumbers, availableColumnNumbers, availableSubsectionNumbers)
      const smallestArray = findSmallestArray(availableRowNumbers, availableColumnNumbers, availableSubsectionNumbers)
      const secondArray = availableRowNumbers !== smallestArray ? availableRowNumbers : availableColumnNumbers
      const thirdArray = availableColumnNumbers !== smallestArray ? availableColumnNumbers : availableSubsectionNumbers

      console.log(smallestArray, secondArray, thirdArray)
      for(let j = smallestArray[0]; j < smallestArray.length; j++){
        //if(arr[biscect()])
      }
      i++
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
        i++
    }*/
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
