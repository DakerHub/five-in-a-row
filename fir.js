(function(window){
window.Fir = function(){
    var _this = this;
    var util = {
        container: null,
        ctx: null,
        width: 0,
        border: 0,
        unit: 0,
        padding: 0,
        blackChess: document.createElement("img"),
        whiteChess: document.createElement("img"),
        fullRec: function (ctx,x,y,r,color,fill){
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            if(fill){
                ctx.fill();
            }else{
                ctx.stroke();
            }
        }
    }
    this.init = function(container,width){
        if(container.nodeType && container.nodeType == 1){
            var clazz = container.getAttribute("class");
            container.setAttribute("class",clazz+" fir-board-wp");
            util.container = container;
            var cvs = document.createElement("canvas");
            util.blackChess.src = "imgs/black.png";//需要修改棋子图片路径
            util.whiteChess.src = "imgs/white.png";//需要修改棋子图片路径
            cvs.width = util.width = width;
            cvs.height = width;
            cvs.id = "board";
            container.appendChild(cvs);
            var ctx = util.ctx = cvs.getContext('2d'),
                border = util.border = width*0.8,
                unit = util.unit =  border/14,
                padding = util.padding =  width*0.1;
            _this.renderBoard(ctx,border,unit,padding);
            var addChess = _this.getChessCtr();
            cvs.onclick = function(e){
                var x = e.offsetX - padding;
                var y = e.offsetY - padding;
                var remX = x%unit;
                var remY = y%unit;
                var intX = (x-remX)/unit;
                var intY = (y-remY)/unit;
                if(remX >= unit*0.75){
                    intX ++;
                }
                if(remY >= unit*0.75){
                    intY ++;
                }
                if(remX > unit*0.25 && remY > unit*0.25 && remX < unit*0.75 && remY < unit*0.75){
                    intX = -1;
                    intY = -1;
                }
                // console.log(intX+"_____"+intY);
                addChess(ctx,intX,intY,padding,unit);
            };
        }
    };
    this.renderBoard = function(ctx,border,unit,padding){
        var x = padding,
            y = padding;
        ctx.beginPath();
        for(var i=0;i<15;i++){
            ctx.moveTo(x,y);
            ctx.lineTo(x,y+border);
            ctx.moveTo(y,x);
            ctx.lineTo(y+border,x);
            x += unit;
            y = padding;
        }
        ctx.stroke();

        // 绘制交叉点“星”
        util.fullRec(ctx,padding+unit*3,padding+unit*3,unit/10,"#000",true);
        util.fullRec(ctx,padding+unit*3,padding+unit*11,unit/10,"#000",true);
        util.fullRec(ctx,padding+unit*11,padding+unit*3,unit/10,"#000",true);
        util.fullRec(ctx,padding+unit*11,padding+unit*11,unit/10,"#000",true);
        util.fullRec(ctx,padding+unit*7,padding+unit*7,unit/10,"#000",true);
    };
    this.getChessCtr = function(){
        var currentRole = 0;
        var board = [];
        for(var i=0;i<15;i++){
            board.push([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]);
        };
        function addChess(ctx,x,y,padding,unit){
            if(x  >= 0 && y  >= 0 && board[y][x] === -1){
                board[y][x] = currentRole;
                if(currentRole === 0){
                    ctx.drawImage(util.blackChess,padding+x*unit-unit/3,padding+y*unit-unit/3,unit*2/3,unit*2/3);
                    currentRole = 1;
                }else{
                    ctx.drawImage(util.whiteChess,padding+x*unit-unit/3,padding+y*unit-unit/3,unit*2/3,unit*2/3);
                    currentRole = 0;
                }
                var arr = checkFinish(x,y);
                if(Array.isArray(arr)){
                    console.log(arr);
                    finishRemind(arr);
                }
            }
        };
        function checkFinish(x,y){
            var valid = {
                vertical:　false, // |
                horizontal: false,// -
                oblique: false,   // /
                antiOblique: false// \
            };
            var arr = checkLine(x,y,1,0);
            if(arr.length >= 5){
                return arr;
            }
            arr = checkLine(x,y,1,1);
            if(arr.length >= 5){
                return arr;
            }
            arr = checkLine(x,y,1,-1);
            if(arr.length >= 5){
                return arr;
            }
            arr = checkLine(x,y,0,1);
            if(arr.length >= 5){
                return arr;
            }
            return;
        };
        function checkLine(x,y,stepX,stepY){
            var currentRole = board[y][x];
            var inRow = 1;
            var arr = [{x:x,y:y}];
            checkFive(x,y,stepX,stepY);
            checkFive(x,y,-stepX,-stepY);
            return arr;
            function checkFive(x,y,stepX,stepY){
                for(var i=0;i<5;i++){
                    x = x+stepX;
                    y = y+stepY;
                    if(x >= 0 && y  >= 0 && x <= 14 && y  <= 14){
                        if(board[y][x] === currentRole){
                            arr.push({
                                x: x,
                                y: y
                            });
                            inRow ++;
                        }else{
                            break;
                        }
                    }else{
                        break;
                    }
                }
            }
        };
        function finishRemind(){
            var cover = document.getElementById("fir-cover");
            var remind = document.getElementById("fir-remind");
            if(cover){
                cover.style.display = "block";
            }else{
                cover = document.createElement("div");
                cover.id = "fir-cover";
                cover.setAttribute("class","fir-cover");
                util.container.appendChild(cover);
            }
            if(remind){
                remind.style.display = "flex";
            }else{
                remind = document.createElement("div");
                remind.id = "fir-remind";
                remind.innerHTML = "<p>游戏结束！</p><button id='fir-restart'>重新开始</button>";
                remind.setAttribute("class","fir-remind");
                util.container.appendChild(remind);
                document.getElementById("fir-restart").onclick = function(){
                    // 初始化界面
                    currentRole = 0;
                    board = [];
                    for(var i=0;i<15;i++){
                        board.push([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]);
                    };  
                    util.ctx.clearRect(0, 0, util.width, util.width);
                    _this.renderBoard(util.ctx,util.border,util.unit,util.padding);
                    cover.style.display = "none";
                    remind.style.display = "none";
                }
            }
        }
        return addChess;
    };
    
}
})(window)