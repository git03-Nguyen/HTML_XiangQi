// Initializing global variables
let chessBoard = document.querySelector(".game-container .chess-board");
let allSquares = Array.from(document.querySelectorAll(".game-container .chess-board .pieces-field .row .square"));
allSquares.forEach((square, index) => {
  square.x = index % 9;
  square.y = Math.floor(index / 9);
}); // saving x/y coordinates for convenience

let currentTurn = 0;   // color being allowed to move (0/red goes first)
let pieceDragged = null;  // piece being dragged to move
let oldSquare = null;     // the previous square of the dragged piece
let hoveringSquare = null; // the square being hovered

document.querySelectorAll(".piece").forEach(piece => {
  piece.addEventListener("mousedown", onMouseDownHandler);
  piece.ondragstart = (event) => event.preventDefault(); // prevent the default behavior of "dragging-image event"
  piece.tableMoves = new Array(); // every pieces has an array saving available moves
  piece.color = piece.classList.contains("black") ? 1 : 0; // 1 is black, 0 is red
});

updateAllMoves(); // calculating the available moves of all pieces (BEST PERF is to use assynchronous programming )

// ----------------------------------------------------------------------------------------------------------------

// Mouse down handler (dragging start)
function onMouseDownHandler(event) {
  if (!event.target.classList.contains("piece")) return;      // item dragged must be a piece
  if (!event.target.classList.contains("draggable")) return;  // only current color has the permission to go

  pieceDragged = event.target;
  oldSquare = pieceDragged.parentElement;
  console.log("Mouse down");

  chessBoard.insertAdjacentElement("afterBegin", pieceDragged);
  pieceDragged.classList.add("dragging");
  oldSquare.classList.add("highlighted");

  movePieceAtSpace(event.clientX, event.clientY); // stick the piece to the mouse cursor
  showMoves(pieceDragged);  // show available moves

  document.addEventListener('mousemove', onMouseMoveHandler);
  document.addEventListener('mouseup', onMouseUpHandler);   // prepare for the dragging work

  // Mouse move handler
  function onMouseMoveHandler(event) {
    console.log("Mouse move");
    movePieceAtSpace(event.clientX, event.clientY); // stick the piece to the mouse cursor
    oldSquare.classList.add("highlighted");

    // getting the square below the dragging piece
    pieceDragged.hidden = true;
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY)?.closest(".square");
    pieceDragged.hidden = false;

    // add another highlight for the hovering square 
    if (elemBelow != hoveringSquare) {
      if (hoveringSquare) {
        hoveringSquare.classList.remove("highlighted");
      }
      hoveringSquare = elemBelow;
      if (hoveringSquare && hoveringSquare.classList.contains("can-move-to")) {
        hoveringSquare.classList.add("highlighted");
      } else {
        hoveringSquare = null;
      }
    }

  }

  // Mouse up handler
  function onMouseUpHandler(event) {
    console.log("Mouse up");
    document.removeEventListener('mousemove', onMouseMoveHandler);
    document.removeEventListener('mouseup', onMouseUpHandler);
    pieceDragged.classList.remove("dragging"); // end the dragging work

    if (!hoveringSquare) {
      oldSquare.append(pieceDragged); // cannot move, return to the old position
    } else {
      if (hoveringSquare.children.length != 0) {
        hoveringSquare.children[0].remove();
        console.log("Removed piece!");
      }
      hoveringSquare.append(pieceDragged); // sucessfully moved to the new position
      currentTurn = currentTurn ? 0 : 1; // change turn
      updateAllMoves(); // at the end of each turn, recalculate the available moves of the next-turn team
    }

    unshowMoves(pieceDragged); // remove highlights
    pieceDragged = null;
    oldSquare = null;
    hoveringSquare = null; // end the dragging work


  }

  function movePieceAtSpace(x, y) {
    const boardRect = chessBoard.getBoundingClientRect();
    pieceDragged.style.left = (x - boardRect.left - pieceDragged.offsetWidth / 2) + "px";
    pieceDragged.style.top = (y - boardRect.top - pieceDragged.offsetHeight / 2) + "px";
  }

}

// highlight all available square that the piece can be moved to
function showMoves(piece) {
  piece.tableMoves.forEach(square => square.classList.add("can-move-to"));
}

// remove the highlight on all square
function unshowMoves(piece) {
  oldSquare?.classList.remove("highlighted");
  hoveringSquare?.classList.remove("highlighted");
  piece.tableMoves.forEach(square => square.classList.remove("can-move-to"));
}

// -----------------------------------------------------------------------------------------------
// Update moves
function updateAllMoves() {

  document.querySelectorAll(".piece").forEach(updateMoves); // loop for current color team to update moves
  document.querySelector("#current-turn").textContent = currentTurn ? "👉 Black turn 👈" : "👉 Red turn 👈"; // Alert the current color

  function updateMoves(piece) {
    let myColor = piece.color;
    if (currentTurn != myColor) {
      piece.classList.remove("draggable"); // disable moving ability if not in its turn
      return;
    }

    // get the current (x,y) square
    let x = piece.parentElement.x;
    let y = piece.parentElement.y;

    piece.tableMoves = new Array();
    if (piece.classList.contains("chariot")) {
      updateChariotMoves(piece);
    } else if (piece.classList.contains("horse")) {
      updateHorseMoves(piece);
    } else if (piece.classList.contains("elephant")) {
      updateElephantMoves(piece);
    } else if (piece.classList.contains("adviser")) {
      updateAdviserMoves(piece);
    } else if (piece.classList.contains("general")) {
      updateGeneralMoves(piece);
    } else if (piece.classList.contains("cannon")) {
      updateCannonMoves(piece);
    } else if (piece.classList.contains("soldier")) {
      updateSoldierMoves(piece);
    }

    piece.classList.add("draggable"); // make it be able to move


    // Calculating for chariots
    function updateChariotMoves(chariot) {
      let squareBeingChecked = null;

      while (true) {
        x++;
        squareBeingChecked = allSquares[x + y * 9];
        if (x > 8 || squareBeingChecked.firstElementChild?.color == myColor) break;
        chariot.tableMoves.push(squareBeingChecked);
        if (squareBeingChecked.firstElementChild) break;
      }

      x = chariot.parentElement.x;
      while (true) {
        x--;
        squareBeingChecked = allSquares[x + y * 9];
        if (x < 0 || squareBeingChecked.firstElementChild?.color == myColor) break;
        chariot.tableMoves.push(squareBeingChecked);
        if (squareBeingChecked.firstElementChild) break;
      }

      x = chariot.parentElement.x;
      while (true) {
        y++;
        squareBeingChecked = allSquares[x + y * 9];
        if (y > 9 || squareBeingChecked.firstElementChild?.color == myColor) break;
        chariot.tableMoves.push(squareBeingChecked);
        if (squareBeingChecked.firstElementChild) break;
      }

      y = chariot.parentElement.y;
      while (true) {
        y--;
        squareBeingChecked = allSquares[x + y * 9];
        if (y < 0 || squareBeingChecked.firstElementChild?.color == myColor) break;
        chariot.tableMoves.push(squareBeingChecked);
        if (squareBeingChecked.firstElementChild) break;
      }
    }

    // Update for horses
    function updateHorseMoves(horse) {
      if (x + 2 < 9 && !allSquares[x + 1 + y * 9].firstElementChild) {
        if (y + 1 < 10 && (!allSquares[x + 2 + (1 + y) * 9].firstElementChild || allSquares[x + 2 + (1 + y) * 9].firstElementChild.color != myColor)) {
          horse.tableMoves.push(allSquares[x + 2 + (1 + y) * 9]);
        }
        if (y - 1 >= 0 && (!allSquares[x + 2 + (y - 1) * 9].firstElementChild || allSquares[x + 2 + (y - 1) * 9].firstElementChild.color != myColor)) {
          horse.tableMoves.push(allSquares[x + 2 + (y - 1) * 9]);
        }
      }

      if (x - 2 >= 0 && !allSquares[x - 1 + y * 9].firstElementChild) {
        if (y + 1 < 10 && (!allSquares[x - 2 + (1 + y) * 9].firstElementChild || allSquares[x - 2 + (1 + y) * 9].firstElementChild.color != myColor)) {
          horse.tableMoves.push(allSquares[x - 2 + (1 + y) * 9]);
        }
        if (y - 1 >= 0 && (!allSquares[x - 2 + (y - 1) * 9].firstElementChild || allSquares[x - 2 + (y - 1) * 9].firstElementChild.color != myColor)) {
          horse.tableMoves.push(allSquares[x - 2 + (y - 1) * 9]);
        }
      }

      if (y + 2 < 10 && !allSquares[x + (1 + y) * 9].firstElementChild) {
        if (x + 1 < 9 && (!allSquares[x + 1 + (2 + y) * 9].firstElementChild || allSquares[x + 1 + (2 + y) * 9].firstElementChild.color != myColor)) {
          horse.tableMoves.push(allSquares[x + 1 + (2 + y) * 9]);
        }
        if (x - 1 >= 0 && (!allSquares[x - 1 + (y + 2) * 9].firstElementChild || allSquares[x - 1 + (y + 2) * 9].firstElementChild.color != myColor)) {
          horse.tableMoves.push(allSquares[x - 1 + (y + 2) * 9]);
        }
      }

      if (y - 2 >= 0 && !allSquares[x + (y - 1) * 9].firstElementChild) {
        if (x + 1 < 9 && (!allSquares[x + 1 + (y - 2) * 9].firstElementChild || allSquares[x + 1 + (y - 2) * 9].firstElementChild.color != myColor)) {
          horse.tableMoves.push(allSquares[x + 1 + (y - 2) * 9]);
        }
        if (x - 1 >= 0 && (!allSquares[x - 1 + (y - 2) * 9].firstElementChild || allSquares[x - 1 + (y - 2) * 9].firstElementChild.color != myColor)) {
          horse.tableMoves.push(allSquares[x - 1 + (y - 2) * 9]);
        }
      }

    }

    // Update for elephants
    function updateElephantMoves(elephant) {
      if (x + 2 < 9 && y + 2 < 10 && !allSquares[x + 1 + (1 + y) * 9].firstElementChild) {
        if (!allSquares[x + 2 + (y + 2) * 9].firstElementChild || allSquares[x + 2 + (y + 2) * 9].firstElementChild.color != myColor) {
          elephant.tableMoves.push(allSquares[x + 2 + (y + 2) * 9]);
        }
      }

      if (x + 2 < 9 && y - 2 >= 0 && !allSquares[x + 1 + (y - 1) * 9].firstElementChild) {
        if (!allSquares[x + 2 + (y - 2) * 9].firstElementChild || allSquares[x + 2 + (y - 2) * 9].firstElementChild.color != myColor) {
          elephant.tableMoves.push(allSquares[x + 2 + (y - 2) * 9]);
        }
      }

      if (x - 2 >= 0 && y + 2 < 10 && !allSquares[x - 1 + (y + 1) * 9].firstElementChild) {
        if (!allSquares[x - 2 + (y + 2) * 9].firstElementChild || allSquares[x - 2 + (y + 2) * 9].firstElementChild.color != myColor) {
          elephant.tableMoves.push(allSquares[x - 2 + (y + 2) * 9]);
        }
      }

      if (x - 2 >= 0 && y - 2 >= 0 && !allSquares[x - 1 + (y - 1) * 9].firstElementChild) {
        if (!allSquares[x - 2 + (y - 2) * 9].firstElementChild || allSquares[x - 2 + (y - 2) * 9].firstElementChild.color != myColor) {
          elephant.tableMoves.push(allSquares[x - 2 + (y - 2) * 9]);
        }
      }
    }

    // Update for advisers
    function updateAdviserMoves(adviser) {

      if (x == 3 || x == 4) {
        if (y == 0 || y == 1 || y == 7 || y == 8) {
          if (!allSquares[x + 1 + (y + 1) * 9].firstElementChild || allSquares[x + 1 + (y + 1) * 9].firstElementChild.color != myColor) {
            adviser.tableMoves.push(allSquares[x + 1 + (y + 1) * 9]);
          }
        }

        if (y == 1 || y == 2 || y == 8 || y == 9) {// ...
          if (!allSquares[x + 1 + (y - 1) * 9].firstElementChild || allSquares[x + 1 + (y - 1) * 9].firstElementChild.color != myColor) {
            adviser.tableMoves.push(allSquares[x + 1 + (y - 1) * 9]);
          }
        }
      }

      if (x == 4 || x == 5) {
        if (y == 0 || y == 1 || y == 7 || y == 8) {
          if (!allSquares[x - 1 + (y + 1) * 9].firstElementChild || allSquares[x - 1 + (y + 1) * 9].firstElementChild.color != myColor) {
            adviser.tableMoves.push(allSquares[x - 1 + (y + 1) * 9]);
          }
        }

        if (y == 1 || y == 2 || y == 8 || y == 9) {// ...
          if (!allSquares[x - 1 + (y - 1) * 9].firstElementChild || allSquares[x - 1 + (y - 1) * 9].firstElementChild.color != myColor) {
            adviser.tableMoves.push(allSquares[x - 1 + (y - 1) * 9]);
          }
        }
      }
    }

    // Update for generals
    function updateGeneralMoves(general) {

      if (x == 3 || x == 4) {
        if (!allSquares[x + 1 + y * 9].firstElementChild || allSquares[x + 1 + y * 9].firstElementChild.color != myColor) {
          general.tableMoves.push(allSquares[x + 1 + y * 9]);
        }
      }

      if (x == 4 || x == 5) {
        if (!allSquares[x - 1 + y * 9].firstElementChild || allSquares[x - 1 + y * 9].firstElementChild.color != myColor) {
          general.tableMoves.push(allSquares[x - 1 + y * 9]);
        }
      }

      if (y == 2 || y == 1 || y == 8 || y == 9) {
        if (!allSquares[x + (y - 1) * 9].firstElementChild || allSquares[x + (y - 1) * 9].firstElementChild.color != myColor) {
          general.tableMoves.push(allSquares[x + (y - 1) * 9]);
        }
      }

      if (y == 0 || y == 1 || y == 7 || y == 8) {
        if (!allSquares[x + (y + 1) * 9].firstElementChild || allSquares[x + (y + 1) * 9].firstElementChild.color != myColor) {
          general.tableMoves.push(allSquares[x + (y + 1) * 9]);
        }
      }
    }

    // Update for cannons
    function updateCannonMoves(cannon) {

      let useCannnon = false;
      while (true) {
        x++;
        if (x > 8) break;
        if (!useCannnon) {
          if (allSquares[x + y * 9].firstElementChild) {
            useCannnon = true;
          } else {
            cannon.tableMoves.push(allSquares[x + y * 9]);
          }
        } else {
          if (allSquares[x + y * 9].firstElementChild) {
            if (allSquares[x + y * 9].firstElementChild.color != myColor) {
              cannon.tableMoves.push(allSquares[x + y * 9]);
            }
            break;
          }
        }
      }

      useCannnon = false;
      x = cannon.parentElement.x;
      while (true) {
        x--;
        if (x < 0) break;
        if (!useCannnon) {
          if (allSquares[x + y * 9].firstElementChild) {
            useCannnon = true;
          } else {
            cannon.tableMoves.push(allSquares[x + y * 9]);
          }
        } else {
          if (allSquares[x + y * 9].firstElementChild) {
            if (allSquares[x + y * 9].firstElementChild.color != myColor) {
              cannon.tableMoves.push(allSquares[x + y * 9]);
            }
            break;
          }
        }
      }

      useCannnon = false;
      x = cannon.parentElement.x;
      while (true) {
        y++;
        if (y > 9) break;
        if (!useCannnon) {
          if (allSquares[x + y * 9].firstElementChild) {
            useCannnon = true;
          } else {
            cannon.tableMoves.push(allSquares[x + y * 9]);
          }
        } else {
          if (allSquares[x + y * 9].firstElementChild) {
            if (allSquares[x + y * 9].firstElementChild.color != myColor) {
              cannon.tableMoves.push(allSquares[x + y * 9]);
            }
            break;
          }
        }
      }

      useCannnon = false;
      y = cannon.parentElement.y;
      while (true) {
        y--;
        if (y < 0) break;
        if (!useCannnon) {
          if (allSquares[x + y * 9].firstElementChild) {
            useCannnon = true;
          } else {
            cannon.tableMoves.push(allSquares[x + y * 9]);
          }
        } else {
          if (allSquares[x + y * 9].firstElementChild) {
            if (allSquares[x + y * 9].firstElementChild.color != myColor) {
              cannon.tableMoves.push(allSquares[x + y * 9]);
            }
            break;
          }
        }
      }
    }

    // Update for soldiers
    function updateSoldierMoves(soldier) {
      if (soldier.color == 1) {
        if (y + 1 <= 9 && allSquares[x + (y + 1) * 9].firstElementChild?.color != myColor) {
          soldier.tableMoves.push(allSquares[x + (y + 1) * 9]);
        }
        if (y > 4) {
          if (x - 1 >= 0 && allSquares[x - 1 + y * 9].firstElementChild?.color != myColor) {
            soldier.tableMoves.push(allSquares[x - 1 + y * 9]);
          }
          if (x + 1 <= 8 && allSquares[x + 1 + y * 9].firstElementChild?.color != myColor) {
            soldier.tableMoves.push(allSquares[x + 1 + y * 9]);
          }
        }
      } else {
        if (y - 1 >= 0 && allSquares[x + (y - 1) * 9].firstElementChild?.color != myColor) {
          soldier.tableMoves.push(allSquares[x + (y - 1) * 9]);
        }
        if (y < 5) {
          if (x - 1 >= 0 && allSquares[x - 1 + y * 9].firstElementChild?.color != myColor) {
            soldier.tableMoves.push(allSquares[x - 1 + y * 9]);
          }
          if (x + 1 <= 8 && allSquares[x + 1 + y * 9].firstElementChild?.color != myColor) {
            soldier.tableMoves.push(allSquares[x + 1 + y * 9]);
          }
        }
      }
    }

  }
}

