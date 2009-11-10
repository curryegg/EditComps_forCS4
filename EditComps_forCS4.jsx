/*   EditComps_CS4   Ver.1.0 2009.07.30

        １．任意に選択した複数のコンポの尺変更とリサイズが同時に出来る。
        ２．尺を変更した時に、コンポ内のレイヤーのアウトポイントを変更後の尺に合わせる。
        ３．リザイズしたときに、コンポ内の平面・調整レイヤーもリサイズする。
           その際、ロックしたレイヤーへの適用の有無が選べる。
        ４．１つのコンポを選んだだけで、その中に含まれる全てのコンポに対して適用できる
        
        と、いった感じです。
        
        
        プロジェクトウインドウ内のコンポを選んで(複数可)、実行してください。
        ダイアログの項目にカーソルを合わせると、いい事あるかもしれません。

*/




var activeItem = app.project.activeItem;
var selectItem = app.project.selection;
var cItems = new Array();
var cID = new Array();
var allItems = app.project.items;
var sID = new Array();
var selectComp = new Array();
var selID = new Array();

var flag = false;
var Wflag = false;
var Hflag = false;
var Dflag = false;
var ActCflag = false;

var mW = null;
var mH = null;
var mD = null;
var oldDur = new Array();
var oldWidth = new Array();
var oldHeight = new Array();
var targetCompName = null;
var compWidth = null;
var compHeight = null;
var anchorPoint = [0.5, 0.5]
var compDuration = null;
var compFrameRate = null;

var chkRB = 5;
var valM = false;
var valAL = false;
var valW;
var valH;
var valD;
var valL;
var lyLock = new Array();
var oldDur = new Array();
var compLys = new Array();
var PFflag = null;

var valR = false;
var curNum = null;
var szW = new Array();
var szH = new Array();
var valWH = false;
var valMK = false;
var uItems = new Array();
var sNum = 0;
var ssNum = 1;
var rpLy = false;



// **** Main Script ***************************************************************************************************************


app.beginUndoGroup("EditComps");

CompSelectChk();

if(flag != true){
                      BuildAndShowDialog();

        if( flag == true && Btnon != "Cancel" || Btnon != "OK"){
        	//alert("******キャンセルされました******");
        }else if ( flag == true && Btnon == "Cancel"){
        	//alert("******キャンセルされました******");
        }else if( flag == true && Btnon == "OK"){
        	//alert("******何も変更されていません******");
        }else{
		    if ( flag != true && Btnon == "OK" ) GetDialogSettings(); MatryoshkaComp();
		    if ( flag != true && Btnon == "OK" ) if(valAL){DepSolid();} ReChk(); EditCompSettings();
		
            chgSolidItems();
        }

}
app.endUndoGroup();









// **** FUNCTION ******************************************************************************************************************
function chkItems()
{
//プロジェクト内の全てのコンポアイテムを下層順に取得


            pp=0;
            qq=0;
            cItems = new Array();
            cID = new Array();
            var outComp = new Array();
            var curID = null;

            for(ii=1;ii<=allItems.length;ii++){
            	//コンポだったら取得
	            if( allItems[ii] instanceof CompItem ){
	            	    //最上層かどうか
	    	            if(allItems[ii].usedIn.length == 0){
	        	            cItems[pp] = allItems[ii];
	    	                cID[pp] = allItems[ii].id;
	    	                pp++;
	    	            //最上層じゃない場合
	    	            }else{
	    	        	    outComp[qq] = allItems[ii];
	    	        	    qq++;
	    	            }
		        //平面アイテムなら取得
	            }else if(allItems[ii] instanceof FootageItem ){
	        	    if(allItems[ii].mainSource == "[object SolidSource]"){
	        	    	if(sID.length > 0){
	        	    		sID.push(allItems[ii].id);
	        	    	}else{
	        	    		sID[0] = allItems[ii].id;
	        	    	}
                    }
	            //その他のアイテム
	            }else{
	        	    //alert(allItems[ii].typeName);
	            }
            }	
       //上層から順番に取得
       if(outComp.length >0){
           do
           {
       	        var valUIn = 0;
       	        //１つ上の階層のコンポを取得
       	    	var uInComp = outComp[0].usedIn;
       	        for(q=0;q<uInComp.length;q++){
       	        	for(r=0;r<cItems.length;r++){
       	        		//１つ上の階層のコンポが[ 上層のコンポ ]だった場合
       	        		if(uInComp[q].id == cID[r]){
       	        			valUIn++;
       	        		}
       	        	}
       	        }
       	        
       	        //１つ上の階層のコンポが全て[ 上層のコンポ ]に含まれる場合
       	        if(uInComp.length == valUIn){
       	        	valCI = false;
       	        	//すでにコンポが含まれていた場合のフラグ
       	        	for(s=0;s<cID.length;s++){
       	        		if(outComp[0].id == cID[s]){
       	        			valCI = true;
       	        			break;
       	        		}
       	        	}
       	        	//[ 上層のコンポ ]に追加
       	        	if(! valCI){
       	        	    cItems.push(outComp[0]);
       	            	cID.push(outComp[0].id);
       	        	}
       	        	//配列から削除
       	        	outComp.shift();
                //追加できない場合
       	        }else{
       	        	if(outComp.length > 1){
       	        		//配列の一番後ろへ後回し
       	        	    outComp.push(outComp[0]);
                        outComp.shift();
       	        	}
       	        }
       	    
       
          } while (outComp.length > 0);
       }
       
       //下層順に並び替え
       cItems.reverse();
       cID.reverse();
       
       //alert(cID);
       
}

//********************************************************************************************************************************

function CompSelectChk()
{
			if ( activeItem == null ) {
				if(selectItem.length == 0){
				    flag = true;
				    alert ( "１つ以上のコンポジションを選択して下さい" ); 
				}else{
					MultiActComp();
				}
			}else{
				SingleActComp();
			}
}

//********************************************************************************************************************************

function SingleActComp()
{
		if (activeItem instanceof CompItem)
		{	
			chkItems();
			
			selectComp = new Array();
			selectComp[0] = activeItem;			
			targetCompName = selectComp[0].name;
			compWidth = selectComp[0].width;
			compHeight = selectComp[0].height;
			compDuration = selectComp[0].duration;
			compFrameRate　=　selectComp[0].frameRate;
			
		    oldDur[0] = selectComp[0].duration;
		    oldWidth[0] = selectComp[0].width;
		    oldHeight[0] = selectComp[0].height;
			
			ActCflag = true;
		}
		else
		{ alert( "１つ以上のコンポジションを選択して下さい" ); flag = true; }
}

//********************************************************************************************************************************

function MultiActComp()
{
		ChkSelectItem();
		
		
		if ( flag != true ){
		
           //複数選択コンポを下層順に並び替え
           pp=0;
           var selComp = new Array();
           for(t=0;t<cID.length;t++){
       	        for(tt=0;tt<selectComp.length;tt++){
       	        	if(cID[t] == selectComp[tt].id){
       	    	    	selComp[pp] = selectComp[tt];
       	    	    	pp++;
       	    	    	break;
       	    	    }
       	        }
           }
       
           selectComp = new Array();
           selectComp = selComp;
           
           //変更前のコンポ尺、横幅、縦幅を取得
	       for(u=0;u<selectComp.length;u++){
	       	   selID[u] = selectComp[u].id;
		       oldDur[u] = selectComp[u].duration;
		       oldWidth[u] = selectComp[u].width;
		       oldHeight[u] = selectComp[u].height;
	       }

		
           GetSelectCompSettings();
           
       }
}

//********************************************************************************************************************************

function ChkSelectItem()
{		
		n = selectItem.length;
		for ( i = 0; i <= n-1; i++ ){
			if ( !(selectItem[i] instanceof CompItem) ){
				selectItem[i].selected = false;
			}
		}
		try {
			selectComp = app.project.selection; 
			
			chkItems();
			
		} catch(e) {
			alert( "１つ以上のコンポジションを選択して下さい" ); flag = true;
		}	
}

//********************************************************************************************************************************

function GetSelectCompSettings()
{
		var n = selectComp.length;

		for ( i = 0; i <= n-1; i++ )
		{
			//targetCompName
			var N = null; if ( n > 1 && N != true ) { targetCompName = "[multi]"; N = true; } else { targetCompName = selectComp[i].name; }

			//compWidth
			if ( Wflag != true )
			{
				if ( i > 0 )
				{
					var beforeValue = compWidth;
					var currentValue = selectComp[i].width;
					if ( beforeValue == currentValue ) { compWidth = currentValue; } else { compWidth = "[multi]"; Wflag = true; }
				} else { compWidth = selectComp[i].width; }
			}

			//compHeight
			if ( Hflag != true )
			{
				if ( i > 0 )
				{
					var beforeValue = compHeight;
					var currentValue = selectComp[i].height;
					if ( beforeValue == currentValue ) { compHeight = currentValue; } else { compHeight = "[multi]"; Hflag = true; }
				} else { compHeight = selectComp[i].height; }
			}
			//compDuration
			if ( Dflag != true )
			{
				if ( i > 0 )
				{
					var beforeValue = compDuration;
					var currentValue = selectComp[i].duration;
					if ( beforeValue == currentValue ) { compDuration = currentValue; } else { compDuration = "[multi]"; Dflag = true; }
				} else { compDuration = selectComp[i].duration; }
			}
			//compFrameRate
			if ( i > 0 ) 
			{
				var beforeValue = compFrameRate;
				var currentValue = selectComp[i].frameRate;				
				if ( beforeValue == currentValue )
				{ compFrameRate = currentValue; }
				else
				{ alert ( "フレームレートが異なるコンポジションが選択されています" ); flag = true; break; }
			} else  { compFrameRate　=　selectComp[i].frameRate; }
		}
}

//********************************************************************************************************************************

//		ダイアログ表示
		function BuildAndShowDialog()
{
	
	
	
    var AnchorBtn1;
    var AnchorBtn2;
    var AnchorBtn3;
    var AnchorBtn4;
    var AnchorBtn5;
    var AnchorBtn6;
    var AnchorBtn7;
    var AnchorBtn8;
    var AnchorBtn9;

	
		ecsDlg = new Window ( "dialog" , "Edit Comps" , [0,0,448,300] );
		
		compNameCaption = ecsDlg.add( "statictext" , [16,10,180,26] , "Composition Name :" ); compNameCaption.justify="right";
		compName = ecsDlg.add( "statictext" , [190,10,432,26] , targetCompName );
		
		sizePnl = ecsDlg.add( "panel" , [16,25,432,140] , "Size" );
		
		    var axLabel;
		    if(Wflag != true || Hflag != true){
		        aX = cul_gcd(compWidth, compHeight);
		        axW = compWidth/aX;
		        axH = compHeight/aX;
		        axLabel = "( " +axW + " , " + axH + " )";
		    }else{
		    	axLabel = "[multi]";
		    }
			compWidthCaption = sizePnl.add( "statictext" , [26,25,65,45] , "Width :" ); compWidthCaption.justify="right";
			var compWidthEdit = sizePnl.add( "edittext" , [72,22.5,124,44.5] , compWidth ); compWidthEdit.justify="center";
			
			compHeightCaption = sizePnl.add( "statictext" , [26,55,65,75] , "Height :" ); compHeightCaption.justify="right";
			var compHeightEdit = sizePnl.add( "edittext" , [72,52.5,124,74.5] , compHeight ); compHeightEdit.justify="center";
			
		    compAx= sizePnl.add("checkbox" , [30, 78, 288, 93],"縦横比を固定 : " + axLabel ); if(Wflag != true && Hflag != true) { compAx.value = true; }else{ compAx.value = false; }
			
			compWidthEdit.onChanging = function() {
				                                                 if(compHeightEdit.text != "[multi]"){
				                                                     if(compAx.value == true){
				                                                     	compHeightEdit.text = Math.round((compWidthEdit.text/axW)*axH);
				                                                     }else{
				                                                 	    aX = cul_gcd(compWidthEdit.text, compHeight);
		                                                                axW = Math.round(compWidthEdit.text/aX);
		                                                                axH = Math.round(compHeightEdit.text/aX);
				                                                 	    compAx.text = "縦横比を固定 : ( " + axW + " , " + axH + " )";
				                                                     }
				                                                     compWidth = compWidthEdit.text;
				                                                 }
			                                                }
			compHeightEdit.onChanging = function() {
                                                                  if(compWidthEdit.text != "[multi]"){
				                                                      if(compAx.value == true){
				                                                        	compWidthEdit.text = Math.round((compHeightEdit.text/axH)*axW);
				                                                      }else{
				                                                 	    aX = cul_gcd(compWidth, compHeightEdit.text);
		                                                                axW = Math.round(compWidthEdit.text/aX);
		                                                                axH = Math.round(compHeightEdit.text/aX);
				                                                 	    compAx.text = "縦横比を固定 : ( " + axW + " , " + axH + " )";
				                                                      }
				                                                      compHeight = compHeightEdit.text;
				                                                   }
			                                                 }
	        compAx.onClick = function() {
	                                                 if(compWidthEdit.text == "[multi]" || compHeightEdit.text == "[multi]"){
	                                                 	  compAx.value = false;
	                                                 }
	                                            }
            
			
			compAnchorCaption1 = sizePnl.add( "statictext" , [260,5,300,20] , "Anchor :" ); compAnchorCaption1.justify="right";
			                                                                                   
			Agroup = sizePnl.add("group",[305, 3, 400, 103]);
			
			pX1=3;
			pX2=33;
			pY1=5;
			pY2=35;
			ss=0;
			uu=0;
			tt=0;
			var Apnl = new Array();
			var AnchorBtn = new Array(9);
			for(ii=0;ii<9;ii++){
					Apnl[ii] = Agroup.add( "panel" , [pX1+(30*ss)+(1*ss), pY1+(30*uu), pX2+(30*ss)+(1*ss), pY2+(30*uu)] , "" );
					btn = Apnl[ii].add( "radiobutton" , [6, 4, 26, 24]);	

                    btn.helpTip = "※複数選択時に入れ子状態の"+
			                         "両方のコンポを選択している"+
			                         "場合、センター以外を選ぶと"+
			                         "子コンポやレイヤーの位置がずれます(仕様)";

					AnchorBtn[ii] = btn;
					ss++;

                    if(ii==0){
                    	AnchorBtn1 = AnchorBtn[ii];
                    	AnchorBtn1.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn1.value =true;
			                                                            chkRB = 1;
			                                                            anchorPoint = [0, 0];
			                                                        }
                                                               }
                    }else if(ii==1){
                    	AnchorBtn2 = AnchorBtn[ii];
                    	AnchorBtn2.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn2.value =true;
			                                                            chkRB = 2;
			                                                            anchorPoint = [0.5, 0];
			                                                        }
                                                               }
                    }else if(ii==2){
                    	AnchorBtn3 = AnchorBtn[ii];
                    	AnchorBtn3.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn3.value =true;
			                                                            chkRB = 3;
			                                                            anchorPoint = [1, 0];
			                                                        }
                                                               }
						ss=0;
						uu++;
					}else if(ii==3){
                    	AnchorBtn4 = AnchorBtn[ii];
                    	AnchorBtn4.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn4.value =true;
			                                                            chkRB = 4;
			                                                            anchorPoint = [0, 0.5];
			                                                        }
                                                               }
					}else if(ii==4){
                    	AnchorBtn5 = AnchorBtn[ii];
                    	AnchorBtn5.value =true;
                    	AnchorBtn5.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn5.value =true;
			                                                            chkRB = 5;
			                                                            anchorPoint = [0.5, 0.5];
			                                                        }
                                                               }
					}else if(ii==5){
                    	AnchorBtn6 = AnchorBtn[ii];
                    	AnchorBtn6.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn6.value =true;
			                                                            chkRB = 6;
			                                                            anchorPoint = [1, 0.5];
			                                                        }
                                                               }
						uu++;
						ss=0;
					}else if(ii==6){
                    	AnchorBtn7 = AnchorBtn[ii];
                    	AnchorBtn7.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn7.value =true;
			                                                            chkRB = 7;
			                                                            anchorPoint = [0, 1];
			                                                        }
                                                               }
					}else if(ii==7){
                    	AnchorBtn8 = AnchorBtn[ii];
                    	AnchorBtn8.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn8.value =true;
			                                                            chkRB = 8;
			                                                            anchorPoint = [0.5, 1];
			                                                        }
                                                               }
					}else if(ii==8){
                    	AnchorBtn9 = AnchorBtn[ii];
                    	AnchorBtn9.onClick = function(){	
                    		                                        for(vv=0;vv<9;vv++){
				                                                       AnchorBtn[vv].value =false;
			                                                        }
			                                                        if(valM || valAL){
			                                                        	AnchorBtn5.value =true;
			                                                        	chkRB = 5;
			                                                        	anchorPoint = [0.5, 0.5];
			                                                        }else{
			                                                            AnchorBtn9.value =true;
			                                                            chkRB = 9;
			                                                            anchorPoint = [1, 1];
			                                                        }
                                                               }
					}
			}


		timePnl = ecsDlg.add( "panel" , [16,140,205,258] , "Time" );
			
			compDurationCaption1 = timePnl.add( "statictext" , [20, 34, 66, 54] , "Duration :" ); compDurationCaption1.justify="left";
			if ( compDuration != "[multi]" ) compDuration = Math.round( compDuration*compFrameRate );
			compDurationEdit = timePnl.add( "edittext" , [90, 28, 140, 50] , compDuration ); compDurationEdit.justify="left";
			compDurationCaption2 = timePnl.add( "statictext" , [146, 34, 170, 54] , "fr" ); compDurationCaption2.justify="left";
		
			fRateCaption1 = timePnl.add( "statictext" , [8, 70, 66, 90] , "FrameRate :" ); fRateCaption1.justify="left";
			fRateCaption2 = timePnl.add( "statictext" , [100, 70, 194, 90] , compFrameRate + " fps"); fRateCaption2.justify="left";

		
	    optionPnl = ecsDlg.add( "panel" , [210,140,432,258] , "Option" );
	    
	            optionCaption1 = optionPnl.add("statictext" , [2, 7, 185, 22],"- Comp Option <単選択時のみ有効> -"); optionCaption1.justify="left";
	            
                SetLyChkBox = optionPnl.add("checkbox" , [5, 26, 185, 41],"Matryoshka Comp");
                SetLyChkBox.helpTip = "※ 未チェックの場合、選択したコンポ"+
                                             " (複数選択可) のみに変更を適用";
                SetLyChkBox.value = false;		
                
                optionCaption2 = optionPnl.add("statictext" , [2, 48, 185, 62],"- Layer Option  < Size のみ有効 > -"); optionCaption2.justify="left";
                
                allLys = optionPnl.add("checkbox" , [5, 67, 185, 82], "調整・平面レイヤーにも適用"); allLys.value = false;
                allLys.helpTip = "※対象のコンポ内の調整・平面レイヤーに対して、リサイズを適用します";
            
                allLys.onClick = function() {
                                                      if(allLys.value == true){
                                                      	    valAL = true;
                                                         	lockedLyChkBox.visible = true;
                                                         	if(valM == true){
                                                         		for(aa=0;aa<9;aa++){
                                                                    AnchorBtn[aa].helpTip = "※[Matryoshka Comp] & [調整・平面レイヤーにも適用]"+
			                                                                                      "　ONの場合、入れ子のコンポ＆レイヤーに"+
			                                                                                      "適用する為、アンカーは"+
			                                                                                      "センターのみになります";
                                                                     }
                                                         	}else{
                                                         		for(aa=0;aa<9;aa++){
                                                                    AnchorBtn[aa].helpTip = "※[調整・平面レイヤーにも適用]"+
			                                                                                      "　ONの場合、入れ子のレイヤーに"+
			                                                                                      "適用する為、アンカーは"+
			                                                                                      "センターのみになります";
                                                                }
                                                            }                                                            	
                                                        }else{
                                                        	valAL = false;
                                                         	lockedLyChkBox.visible = false;
                                                         	if(valM){
                                                         		for(aa=0;aa<9;aa++){
                                                                    AnchorBtn[aa].helpTip = "※[Matryoshka Comp]"+
			                                                                                      "　ONの場合、入れ子のコンポに"+
			                                                                                      "適用する為、アンカーは"+
			                                                                                      "センターのみになります";
                                                                     }
                                                         	}else{
                                                         		for(aa=0;aa<9;aa++){
                                                                    AnchorBtn[aa].helpTip = "※複数選択時に入れ子状態の"+
			                                                                                      "両方のコンポを選択している"+
			                                                                                      "場合、センター以外を選ぶと"+
			                                                                                      "子コンポやレイヤーの位置がずれます(仕様)";
                                                                }
                                                            }      
                                                        }

	                                                 }

                
		            lockedLyChkBox = optionPnl.add( "checkbox" , [20, 87, 210, 102] , "ロックされたレイヤーには不適用" ); lockedLyChkBox.value = true; lockedLyChkBox.visible = false;
		            lockedLyChkBox.helpTip = "ロックされているレイヤーには適用しません。"+
		                                             "コンポレイヤーがロックされている場合、"+
		                                             "そのコンポとそれに含まれる平面にも不適用";

                
                    SetLyChkBox.onClick = function() {
                                                              //コンポを単選択の場合
                    	                                      if(ActCflag == true){
                	                                              if(SetLyChkBox.value == true){
                                                                        valM = true;
                                                                        SetLyChkBox.helpTip = "※ 単選択のコンポ内に含む、未選択の"+
                                                                                                     "全てのコンポに対して変更を適用";
                                                                        if(valAL){
                                                                             for(aa=0;aa<9;aa++){
                                                                                  AnchorBtn[aa].helpTip = "※[Matryoshka Comp] & [調整・平面レイヤーにも適用]"+
			                                                                                                     "　ONの場合、入れ子のコンポ＆レイヤーに"+
			                                                                                                     "適用する為、アンカーは"+
			                                                                                                     "センターのみになります";
                                                                              }
                                                                         }else{
                                                                              for(aa=0;aa<9;aa++){
                                                                                  AnchorBtn[aa].helpTip = "※[Matryoshka Comp]"+
			                                                                                                     "　ONの場合、入れ子のコンポに"+
			                                                                                                     "適用する為、アンカーは"+
			                                                                                                     "センターのみになります";
                                                                               }
                                                                         }             
                	                                               }else{
                                                                        valM = false;                	
                                                                        SetLyChkBox.helpTip = "※ 未チェックの場合、選択したコンポ"+
                                                                                                     " (複数選択可) のみに変更を適用";
                                                                        if(valAL){
                                                                            for(aa=0;aa<9;aa++){
                                                                                AnchorBtn[aa].helpTip = "※[調整・平面レイヤーにも適用]"+
			                                                                                                  "　ONの場合、入れ子のレイヤーに"+
			                                                                                                  "適用する為、アンカーは"+
			                                                                                                  "センターのみになります";
                                                                            }
                                                                        }else{
                                                                            for(aa=0;aa<9;aa++){
                                                                                AnchorBtn[aa].helpTip = "※複数選択時に入れ子状態の"+
			                                                                                                  "両方のコンポを選択している"+
			                                                                                                  "場合、センター以外を選ぶと"+
			                                                                                                  "子コンポやレイヤーの位置がずれます(仕様)";
                                                                            }
                                                                        }
                	                                                }
                	                                          //コンポを複数選択の場合
                    	                                      }else{
                    	                                          SetLyChkBox.value = false;
                                                                  valM = false;
                                                                  SetLyChkBox.helpTip = "※ 未チェックの場合、選択したコンポ"+
                                                                                               " (複数選択可) のみに変更を適用";
                                                                  if(valAL){
                                                                            for(aa=0;aa<9;aa++){
                                                                                AnchorBtn[aa].helpTip = "※[調整・平面レイヤーにも適用]"+
			                                                                                                  "　ONの場合、入れ子のレイヤーに"+
			                                                                                                  "適用する為、アンカーは"+
			                                                                                                  "センターのみになります";
                                                                            }
                                                                  }else{
                                                                            for(aa=0;aa<9;aa++){
                                                                                AnchorBtn[aa].helpTip = "※複数選択時に入れ子状態の"+
			                                                                                                  "両方のコンポを選択している"+
			                                                                                                  "場合、センター以外を選ぶと"+
			                                                                                                  "子コンポやレイヤーの位置がずれます(仕様)";
                                                                            }
                                                                  }
                    	                                      }
                                                          }
		
	//最初の表示情報
	mW = compWidth;
	mH = compHeight;
	mD = compDuration;
		        
		cancelBtn = ecsDlg.add( "button" , [230,263,326,293] , "Cancel" , {name:"cancel"} );
		okBtn = ecsDlg.add( "button" , [336,263,432,293] , "OK" , {name:"ok"} );
		
		cancelBtn.onClick = function() {
			                                       Btnon = "Cancel";
			                                       ecsDlg.close();
			                                       flag = true;

			                                  }
		okBtn.onClick = function() { Btnon = "OK";
		                                   ecsDlg.close();
		                                   valW = compWidthEdit.text;
		                                   valH = compHeightEdit.text;
		                                   valD =compDurationEdit.text;
		                                   valAL = allLys.value;
		                                   valL = lockedLyChkBox.value; 
		                                   okBtnOn();
		                                 }
		                                 
        ecsDlg.onClose = function() { 
        	                                 if( Btnon == "OK"){
		                                         valW = compWidthEdit.text;
		                                         valH = compHeightEdit.text;
		                                         valD =compDurationEdit.text;
		                                         valAL = allLys.value;
		                                         valL = lockedLyChkBox.value; 
		                                         okBtnOn();
        	                                 }else if( Btnon == "Cancel"){
			                                     flag = true;
        	                                 }else{
        	                                 	flag = true;
        	                                 }
                                           }
        ecsDlg.center();
		ecsDlg.show();
}

//********************************************************************************************************************************

function okBtnOn(){
	
	if(valM){
		anchorPoint = [0.5, 0.5];
	}
	if(! valAL){
		valL = false;
	}else{
		anchorPoint = [0.5, 0.5];
	}
	//alert(chkRB + "_" + valM + "_" + valW + "_" + valH + "_" + valD + "_" + valAL + "_" + valL);
	//alert(chkRB + "_" + String(anchorPoint));

    chkInfo();

}

//********************************************************************************************************************************

function chkInfo(){

    if(mW == valW && mH == valH && mD == valD){

    	flag = true;
    }

}

//********************************************************************************************************************************

function cul_gcd(x, y){

    //縦横比を計算
    while (y != 0){
      r = x % y;
      x = y;
      y = r;

    }
    return x;

}

//********************************************************************************************************************************

function　GetDialogSettings()
{		
		//コンポ幅、高さ、アンカーポイント、１シート尺、継続時間の取得
		compWidth = valW; flag = /[^0-9]/.test( compWidth );
		if ( flag == true ) compWidth = "[multi]";
		
		compHeight = valH; flag = /[^0-9]/.test( compHeight );
		if ( flag == true ) compHeight = "[multi]";

		compDuration = valD;
		flag = /[^0-9]/.test( compDuration );

			if ( flag == true )
			{				
				//コンポ尺に「+」と「-」が重複して含まれていた場合
				if ( /[\+]/.test( compDuration ) == true && /[\-]/.test( compDuration ) == true ) { compDuration = 1; var flag = false; }
				
				//コンポ尺に「+」が１つだけ含まれていた場合
				if ( flag == true )
				{
					var plusSplit = compDuration.split("+");
					if ( /[\+]/.test( compDuration ) == true && String(plusSplit[2]) == "undefined" )
					{
						var S = parseFloat(plusSplit[0],10); var F = parseFloat(plusSplit[1],10);
						compDuration = eval( S*compFrameRate+F ); var flag = false;
					}
				}
				
				//コンポ尺に「-」が１つだけ含まれていた場合
				if ( flag == true )
				{
					var minusSplit = compDuration.split("-");
					if ( /[\-]/.test( compDuration ) == true && String(minusSplit[2]) == "undefined" )
					{
						var S = parseFloat(minusSplit[0],10); var F = parseFloat(minusSplit[1],10);
						compDuration = eval( (S-1)*144+F ); var flag = false;
					}
				}
			}
			else
			{ compDuration = parseFloat(compDuration,10); var flag = false; }
			
			//コンポ尺に数字と「+、-」以外の文字列が含まれていた場合
			if ( String(compDuration) == "NaN" || compDuration == "" || compDuration == "[multi]" ) { compDuration = "[multi]"; var flag = false; }
			if ( flag == true ) compDuration = 1;
}

//********************************************************************************************************************************

function MatryoshkaComp()
{
	//選択コンポ内の全てのコンポを取得
	if(valM){
        
		var chkComp = new Array();
		var chkID = new Array();
		var ccComp = new Array();
		chkComp[0] = selectComp[0];
		chkID[0] = selectComp[0].id;
		lyLock[0] = false;
		
        do {
		    var chkLy = new Array();
		    var chkC = false;
		    var chkCC = false;
		    g=0;
        	for(kk=0;kk<chkComp.length;kk++){
        		try
        		{
        			chkLy = chkComp[kk].layers;
                    var nC;
        	    	for(kkk=1;kkk<=chkLy.length;kkk++){
        	    		nn=0;
        	    		while(nn<cID.length)
        	    		{
        	    			//レイヤーに同じIDのコンポアイテムがあるかどうか
        	    			if(chkLy[kkk].source == "[object CompItem]" && cID[nn] == chkLy[kkk].source.id){
        	    				chkCC = true;
        	    				nC = nn;
        	    				break;
        	    			}
        	    			nn++;
        	    		}

			            if( chkCC ){
			            	chkCC = false;
			            	//同じコンポが重複されているかどうか
			            	for(cc=0;cc<chkID.length;cc++){
			            		if(chkLy[kkk].source.id == chkID[cc]){
			            			chkCC = true;
			            			break;
			            		}
			            	}
			            	//重複していなければ追加
			            	if(! chkCC){
				                    chkID.push(chkLy[kkk].source.id);
				                    ccComp[g] = cItems[nC];
				                    g++;
				                    chkC=true;
				                    if(chkLy[kkk].locked == true){
				                    	lyLock.push(chkLy[kkk]);
				                    }else{
				                	    lyLock.push(false);
				                    }
			            	}
			            	chkCC = false;
			            }        			
   
        		    }
        		}
        	    catch(e)
        	    {

        	    }

        	}

            if(chkC){
                chkComp = new Array();
        	    chkComp = ccComp;
        	    ccComp = new Array();
        	    g=0;
        	}   
	
        } while (chkC);
        
        //alert(chkID.length);
        
        if(chkID.length > 1){
        	nn=0;
        	mm=0;
        	selectComp = new Array();
        	while(nn<chkID.length)
        	{
        		//「ロックされたレイヤーには不適用」がＯＮ
        		if(valL){
        			if(lyLock[nn] == false){
                        for(ppp=0;ppp<cID.length;ppp++){
                        	if(chkID[nn] == cID[ppp]){
                		        selectComp[mm] = cItems[ppp];
                		        mm++;
                	        }
                        }
        			}
        		//「ロックされたレイヤーには不適用」がＯＦＦ
        		}else{
        			//ロックしてあるレイヤーを解除
        			if(lyLock[nn] == true){
        			    lyLock[nn].locked = false;
        			}
                    for(ppp=0;ppp<cID.length;ppp++){
                       if(chkID[nn] == cID[ppp]){
                		    selectComp[mm] = cItems[ppp];
                		    mm++;
                	   }
                    }
        		}
        	    nn++;
        	}
        }
        
        //下層順に並び替え
        selectComp.reverse();
        
	}
	
	
	//変更前のコンポ尺、横幅、縦幅を取得
	selID = new Array();
	for(u=0;u<selectComp.length;u++){
		selID[u] = selectComp[u].id;
		oldDur[u] = selectComp[u].duration;
		oldWidth[u] = selectComp[u].width;
		oldHeight[u] = selectComp[u].height;
	}
	
}

//********************************************************************************************************************************

function EditCompSettings()
{

		ChangeCompSize();
		ChangeCompDuration();
		//プレースホルダ削除
		if( PFflag == true ) Placeholder.remove();
		//設定済みコンポジション選択
		var n = selectComp.length;
		for ( i = 0; i <= n-1; i++ ) { selectComp[i].selected = true; }
		//情報パネル表示
		clearOutput();
		writeLn( "EditCompSettings Info" );
		writeLn( selectComp.length+"個のコンポ設定を変更しました。" );
		
}

//********************************************************************************************************************************

//		コンポサイズ変更
function ChangeCompSize()
{		

		if ( compWidth != "[multi]" && compHeight != "[multi]" ) { var flag = "WH"; } else { var flag = false; }
		if ( flag == false ) if ( compWidth != "[multi]" && compHeight == "[multi]" ) { var flag = "W"; }  else { var flag = false; }
		if ( flag == false ) if ( compWidth == "[multi]" && compHeight != "[multi]" ) { var flag = "H"; }  else { var flag = false; }
			
		if ( flag != false )
		{
			//アンカー用プレースホルダ作成
			Placeholder = app.project.importPlaceholder("EditCompSettings_Placeholder",4,4,compFrameRate,1);
			PFflag = true;
			
			for ( i = 0; i <= selectComp.length-1; i++ )
			{
				        var curComp = selectComp[i];
						selectComp[i].layers.add( Placeholder );//プレースホルダ配置
						var curPlaceholder = selectComp[i].layer(1);
						curPlaceholder.selected = false;
						
						//アンカーポイントへ移動
						curPlaceholder.position.setValue( [ selectComp[i].width*anchorPoint[0] , selectComp[i].height*anchorPoint[1] ] )
						
						//プレースホルダと親子付け
						var LockLys = new Array();
						var ACLn = selectComp[i].numLayers;
						
 					    if ( ACLn > 1 )
						{
							for( ii = 2; ii < ACLn+1; ii++ )
							{
								var curLayer = selectComp[i].layer(ii);
								if ( curLayer.locked == true ) { curLayer.locked = false; if(LockLys.length > 0){LockLys.push(curLayer);}else{LockLys[0] = curLayer;} } else { curLayer.selected = false; }
								if ( curLayer.parent == null ) { curLayer.parent = selectComp[i].layer(1); }
							}
						}


						//コンポリサイズ
						if ( flag == "WH" )	{ selectComp[i].width = eval(compWidth); selectComp[i].height = eval(compHeight); }//Width,Height両変更
						if ( flag == "W" )	{ selectComp[i].width = eval(compWidth); }//Widthのみ変更
						if ( flag == "H" )	{ selectComp[i].height = eval(compHeight); }//Heightのみ変更
						
						//アンカーポイントへ移動
						curPlaceholder.position.setValue( [ selectComp[i].width*anchorPoint[0] , selectComp[i].height*anchorPoint[1] ] )		
						//プレースホルダとの親子分離
						if ( ACLn > 1 )
						{
							for( ii = 2; ii <= ACLn; ii++ )
							{
								var curLayer = selectComp[i].layer(ii);
								if ( curLayer.parent == selectComp[i].layer(1) ) curLayer.parent = null;
								//for( L = 0; L <= lockedLayer.length-1; L++ ) { if ( lockedLayer[L] == curLayer ) curLayer.locked = true; }
							}
						}
		    //ロックしていた場合、再ロック
		    
		    for(ww=0;ww<LockLys.length;ww++){
				LockLys[ww].locked = true;
		    }
			}
		}

}

//********************************************************************************************************************************

//平面アイテムを複製
function DepSolid()
{

    var uID = new Array(); 

	do{
		//allItems = app.project.items;
	    for(u=1;u<=allItems.length;u++){

	            if(allItems[u].id == sID[0]){
	        		//平面アイテムを使用しているコンポがある場合
			        if(allItems[u].usedIn.length > 0){
			        	var chkSC = new Array();
				        for(uu=0;uu<allItems[u].usedIn.length;uu++){
					        for(ss=0;ss<selectComp.length;ss++){
					        	//使用しているコンポが選択コンポかどうか判別
						        if(allItems[u].usedIn[uu].id == selectComp[ss].id){
					                if(chkSC.length > 0){
						                chkSC.push(allItems[u].usedIn[uu]);
					                }else{
						                chkSC[0] = allItems[u].usedIn[uu];
					                }
						        }
					       }
				        }

			            //選択コンポが１つだった場合
				        if(chkSC.length == 1){
				        	//平面アイテムを使用しているコンポが１つの場合
				        	if(allItems[u].usedIn.length == 1){
					            oneSolidA(allItems, chkSC[0], u);
					        //２つ以上の場合(未選択のコンポでも使用している場合)
				        	}else{
				        		oneSolidB(allItems, chkSC[0], u);
				        	}
					    //選択コンポが２つ以上あった場合
				        }else if(chkSC.length >= 2){
				        	
					        var chkW = new Array();
					        chkW[0] = chkSC[0].width;
					        var chkH = new Array();
					        chkH[0] = chkSC[0].height;					        

                            //各コンポのサイズを比較
					        for(uu=1;uu<chkSC.length;uu++){
					        	//コンポの横幅を比較
					            var chgW = false;
                                for(uuu=0;uuu<chkW.length;uuu++){
                                	if(chkSC[uu].width == chkW[uuu]){
                                		chgW =true;
                                		break;
                                	}
                                }
                                
                                if(! chgW){
                                	chkW.push(chkSC[uu].width);
                                }
                                
                                //コンポの縦幅を比較
                                var chgH = false;
                                for(uuu=0;uuu<chkH.length;uuu++){
                                	if(chkSC[uu].height == chkH[uuu]){
                                		chgH =true;
                                		break;
                                	}
                                }
                                
                                if(! chgH){
                                	chkH.push(chkSC[uu].height);
                                }
					        }
					        
					        	uItems = new Array();
					        	if(chkW.length >= chkH.length){
					        		sNum = chkW.length;
					        	}else{
					        		sNum = chkH.length;
					        	}
					        	ssNum = 1;
					        	//alert(sNum);
					        	//「ロックされたレイヤーには不適用」がＯＮの場合、各コンポ内にロックレイヤーがあるかどうか判別
					        	if(valL){
					        		var lockLy = false;
					        		for(uu=0;uu<chkSC.length;uu++){
					        		    var curLys = chkSC[uu].layers;
        	                            lockLy = false;
        	                            for(c=1;c<=curLys.length;c++){
        		                            if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			                            if(curLys[c].source.id == allItems[u].id){
        				                            //ロックされているかどうか
        				                            if(curLys[c].locked == true){
        					                            lockLy = true;
        					                            break;
        				                            }
        			                            }
        		                            }
        	                            }
        	                            
        	                            if(lockLy){
        	                            	break;
        	                            }
					        		}
					        		//ロックレイヤーがあった場合
					        		if(lockLy){
					        			for(uu=0;uu<chkSC.length;uu++){
					        		        someSolidA(allItems, chkSC[uu], u, uu);
					        		    }
					        		//ロックレイヤーが無かった場合
					        		}else{
					        			//使用コンポの全てが選択コンポだった場合
					                    if(allItems[u].usedIn.length == chkSC.length){
					                    	valR = false;
					        			    for(uu=0;uu<chkSC.length;uu++){
					        		            someSolidB(allItems, chkSC[uu], u, uu);
					        		            valR = true;
					        		        }
					                    }else{
					                    	for(uu=0;uu<chkSC.length;uu++){
					        		            someSolidA(allItems, chkSC[uu], u, uu);
					        		        }
					                    }
					        		}
					        	//「ロックされたレイヤーには不適用」がＯＦＦ
					        	}else{
					        		//使用コンポの全てが選択コンポだった場合
					                if(allItems[u].usedIn.length == chkSC.length){
					                	valR = false;
					        		    for(uu=0;uu<chkSC.length;uu++){
					        		        someSolidB(allItems, chkSC[uu], u, uu);
					        		        valR = true;
					        		    }
					        		//使用コンポの中に未選択のコンポがある場合
					                }else{
					                	for(uu=0;uu<chkSC.length;uu++){
					        		        someSolidA(allItems, chkSC[uu], u, uu);
					        		    }
					                }
					        	}

				        }
			        }
			        
			        sID.shift();
			        break;
	            }
	        
	    }
	}while (sID.length > 0);
		
		
		

	
}

//********************************************************************************************************************************

function someSolidA(allItems, curUsed, iNum, uNum)
{
	
        	var curLys = curUsed.layers;
        	var cN = null;
        	valWH = false;
        	var curS = null;
        	
        	if(uItems.length > 0){
        		for(c=0;c<uItems.length;c++){
        			for(cc=1;cc<=allItems.length;cc++){
        				if(uItems[c] == allItems[cc].id && szW[c] == curUsed.width && szH[c] == curUsed.height){
        					curS = allItems[cc];
        					valWH = true;
        					break;
        				}
        			}
        			
        			if(valWH){
        				break;
        			}
        		}
        	}
        	
        	
        	
        	if(! valWH){
        		curNum = null;
	            addC = curUsed.layers.addSolid(allItems[iNum].mainSource.color, allItems[iNum].name + "_addSolid" + (uNum+1) , allItems[iNum].width, allItems[iNum].height, 1, 1);
	            curNum = addC.source.id;
	        
	            if(uItems.length > 0){
                    uItems.push(curNum);
                    szW.push(curUsed.width);
                    szH.push(curUsed.height);
	            }else{
	        	    uItems[0] = curNum;
			        szW[0] = curUsed.width;
			        szH[0] = curUsed.height;
	            }
	        
                addC.remove();
            
                valMK = true;
        	}
            
                rpLy = false;
        	    for(c=1;c<=curLys.length;c++){
        		    if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			    if(curLys[c].source.id == allItems[iNum].id){
        				    //ロックされてなければ、複製した平面アイテムと入れ替え
        				    if(curLys[c].locked == false){
        				    	rpLy = true;
        				    	if(valWH){
        				    		curLys[c].replaceSource(curS, true);
        				    	}else{
        				    	    for(cc=1;cc<=allItems.length;cc++){
        				    	        if(allItems[cc].id == curNum){
        					                curLys[c].replaceSource(allItems[cc], true);
        					                cN = cc;
        				    	        }
        				    	    }
        				    	}
        				    	
        				    }else{
        				    	if(! valL){
        				    		
        				    	    rpLy = true;
        				    	    if(valWH){
        				    	    	curLys[c].replaceSource(curS, true);
        				    	    }else{
        				    	        for(cc=1;cc<=allItems.length;cc++){
        				    	            if(allItems[cc].id == curNum){
        					                    curLys[c].replaceSource(allItems[cc], true);
        					                    cN = cc;
        				    	            }
        				    	        }
        				    	    }
        				    		
        				    	}
        				    }
        			    }
        		    }
        	    }
        	                
                //複製した平面をリサイズ
                if(rpLy){
                    if(valMK){
                        ResizeSolid(allItems[cN], curUsed);
                        valMK = false;
                    }
                }else{
                	for(cc=1;cc<=allItems.length;cc++){
                	    if(allItems[cc].id == curNum){
                	        allItems[cc].remove();
                	    }
                	}
                }
            
                
}

//********************************************************************************************************************************

function someSolidB(allItems, curUsed, iNum, uNum)
{
	var cN = null;
	//最後の平面は元を使用
	if(ssNum < sNum){
        	var curLys = curUsed.layers;
        	valWH = false;
        	var curS = null;
        	
        	if(uItems.length > 0){
        		for(c=0;c<uItems.length;c++){
        			for(cc=1;cc<=allItems.length;cc++){
        				if(uItems[c] == allItems[cc].id && szW[c] == curUsed.width && szH[c] == curUsed.height){
        					curS = allItems[cc];
        					valWH = true;
        					break;
        				}
        			}
        			
        			if(valWH){
        				break;
        			}
        		}
        	}
        	
        	
        	
        	if(! valWH){
        		curNum = null;
	            addC = curUsed.layers.addSolid(allItems[iNum].mainSource.color, allItems[iNum].name + "_addSolid" + (uNum+1) , allItems[iNum].width, allItems[iNum].height, 1, 1);
	            curNum = addC.source.id;
	            ssNum++;
	        
	            if(uItems.length > 0){
                    uItems.push(curNum);
                    szW.push(curUsed.width);
                    szH.push(curUsed.height);
	            }else{
	        	    uItems[0] = curNum;
			        szW[0] = curUsed.width;
			        szH[0] = curUsed.height;
	            }
	        
                addC.remove();
            
                valMK = true;
        	}
            
        	    for(c=1;c<=curLys.length;c++){
        		    if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			    if(curLys[c].source.id == allItems[iNum].id){
        				    //ロックされてなければ、複製した平面アイテムと入れ替え
        				    if(curLys[c].locked == false){
        				    	
        				    	if(valWH){
        				    		curLys[c].replaceSource(curS, true);
        				    	}else{
        				    	    for(cc=1;cc<=allItems.length;cc++){
        				    	        if(allItems[cc].id == curNum){
        					                curLys[c].replaceSource(allItems[cc], true);
        					                cN = cc;
        				    	        }
        				    	    }
        				    	}
        				    	
        				    }else{
        				    	if(! valL){
        				    		
        				        	if(valWH){
        				    		    curLys[c].replaceSource(curS, true);
        				    	    }else{
        				    	        for(cc=1;cc<=allItems.length;cc++){
        				    	            if(allItems[cc].id == curNum){
        					                    curLys[c].replaceSource(allItems[cc], true);
        					                    cN = cc;
        				    	            }
        				    	        }
        				    	    }
        				    	    
        				    	}
        				    }
        			    }
        		    }
        	    }
        	                
                //複製した平面をリサイズ
                if(valMK){
                    ResizeSolid(allItems[cN], curUsed);
                    valMK = false;
                }
	}else{
		    var curLys = curUsed.layers;
        	valWH = false;
        	var curS = null;
        	
        	if(uItems.length > 0){
        		for(c=0;c<uItems.length;c++){
        			for(cc=1;cc<=allItems.length;cc++){
        				if(uItems[c] == allItems[cc].id && szW[c] == curUsed.width && szH[c] == curUsed.height){
        					curS = allItems[cc];
        					valWH = true;
        					break;
        				}
        			}
        			
        			if(valWH){
        				break;
        			}
        		}
        	}
        	
        	if(! valWH){
        	    for(c=1;c<=curLys.length;c++){
        		    if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			    if(curLys[c].source.id == allItems[iNum].id){
        				    //ロックされてなければ、複製した平面アイテムと入れ替え
        				    if(curLys[c].locked == false){
        					    curLys[c].replaceSource(allItems[iNum], true);
        				    }else{
        				    	if(! valL){
        				    		curLys[c].replaceSource(allItems[iNum], true);
        				    	}
        				    }
        			    }
        		    }
        	    }
        	    
        	    //複製した平面をリサイズ
        	    if(! valR){
                    ResizeSolid(allItems[iNum], curUsed);
        	    }
        	}else{
        	    for(c=1;c<=curLys.length;c++){
        		    if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			    if(curLys[c].source.id == allItems[iNum].id){
        				    //ロックされてなければ、複製した平面アイテムと入れ替え
        				    if(curLys[c].locked == false){
        					    curLys[c].replaceSource(curS, true);
        				    }
        			    }
        		    }
        	    }
        	}
	}
}

//********************************************************************************************************************************

function oneSolidA(allItems, curUsed, iNum)
{
	//「ロックされたレイヤーには不適用」がＯＮ
	var cN = null;
	if(valL){

        	var curLys = curUsed.layers;
        	var lockLy = false;
        	
        	for(c=1;c<=curLys.length;c++){
        		if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			if(curLys[c].source.id == allItems[iNum].id){
        				//ロックされているかどうか
        				if(curLys[c].locked == true){
        					lockLy = true;
        					break;
        				}
        			}
        		}
        	}
        	
        	//ロックされているレイヤーがあれば、平面アイテムを複製して、ロックされていないレイヤーと入れ替え
        	if(lockLy){
        		curNum = null;
	        	addC = curUsed.layers.addSolid(allItems[iNum].mainSource.color, allItems[iNum].name + "_addSolid" , allItems[iNum].width, allItems[iNum].height, 1, 1);
	        	curNum = addC.source.id;
                addC.remove();

                rpLy = false;
        	    for(c=1;c<=curLys.length;c++){
        		    if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			    if(curLys[c].source.id == allItems[iNum].id){
        				    //ロックされてなければ、複製した平面アイテムと入れ替え
        				    if(curLys[c].locked == false){
        				    	rpLy = true;
        				    	for(cc=1;cc<=allItems.length;cc++){
        				    		if(allItems[cc].id == curNum){
        					            curLys[c].replaceSource(allItems[cc], true);
        					            cN = cc;
        					            break;
        				    		}
        				    	}
        				    	
        				    }
        			    }
        		    }
        	    }
        	                
                //複製した平面をリサイズ
                if(rpLy){
                    ResizeSolid(allItems[cN], curUsed);
                }
                
            //無ければ、元の平面アイテムをリサイズ
        	}else{
        		
                ResizeSolid(allItems[iNum], curUsed);
                
        	}

    //「ロックされたレイヤーには不適用」がＯＦＦの場合、元の平面アイテムをリサイズ
	}else{

            ResizeSolid(allItems[iNum], curUsed);
        
	}
	
}

//********************************************************************************************************************************

function oneSolidB(allItems, curUsed, iNum)
{
	//「ロックされたレイヤーには不適用」がＯＮ
	var cN = null;
	if(valL){

        	var curLys = curUsed.layers;
        	curNum = null;
        	
	      　addC = curUsed.layers.addSolid(allItems[iNum].mainSource.color, allItems[iNum].name + "_addSolid" , allItems[iNum].width, allItems[iNum].height, 1, 1);
	        curNum = addC.source.id;
            addC.remove();
                
                rpLy = false;
         	    for(c=1;c<=curLys.length;c++){
        		    if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			    if(curLys[c].source.id == allItems[iNum].id){
        				    //ロックされてなければ、複製した平面アイテムと入れ替え
        				    if(curLys[c].locked == false){
        				    	rpLy = true;
        				    	for(cc=1;cc<=allItems.length;cc++){
        				    		if(allItems[cc].id == curNum){
        					            curLys[c].replaceSource(allItems[cc], true);
        					            cN = cc;
        				    		}
        				    	}
        				    	
        				    }
        			    }
        		    }
        	    }
        	                   
            //複製した平面をリサイズ
            if(rpLy){
                ResizeSolid(allItems[cN], curUsed);
            }
                

    //「ロックされたレイヤーには不適用」がＯＦＦの場合、平面アイテムを複製して、全てのレイヤーと入れ替え
	}else{

			var curLys = curUsed.layers;
			curNum = null;
			
	        addC = curUsed.layers.addSolid(allItems[iNum].mainSource.color, allItems[iNum].name + "_addSolid" , allItems[iNum].width, allItems[iNum].height, 1, 1);
	        curNum = addC.source.id;
            addC.remove();

         	    for(c=1;c<=curLys.length;c++){
        		    if(curLys[c].source == "[object FootageItem]" && curLys[c].source.mainSource == "[object SolidSource]"){
        			    if(curLys[c].source.id == allItems[iNum].id){
        				    //ロックされていれば、解除して複製した平面アイテムと入れ替え
        				    if(curLys[c].locked == true){
        				    	curLys[c].locked = false;
        				    	
        				    	for(cc=1;cc<=allItems.length;cc++){
        				    		if(allItems[cc].id == curNum){
        					            curLys[c].replaceSource(allItems[cc], true);
        					            cN = cc;
        				    		}
        				    	}
        				    	
        					    curLys[c].locked = true;
        				    }else{
        				    	for(cc=1;cc<=allItems.length;cc++){
        				    		if(allItems[cc].id == curNum){
        				    	        curLys[c].replaceSource(allItems[cc], true);
        				    	        cN = cc;
        				    		}
        				    	}
        				    }
        			    }
        		    }
        	    }
        	                
            //複製した平面をリサイズ
            ResizeSolid(allItems[cN], curUsed);

	}
	
}

//********************************************************************************************************************************

function ResizeSolid(curItem, curUsed)
{
	
		if ( compWidth != "[multi]" && compHeight != "[multi]" ) { var flag = "WH"; } else { var flag = false; }
		if ( flag == false ) if ( compWidth != "[multi]" && compHeight == "[multi]" ) { var flag = "W"; }  else { var flag = false; }
		if ( flag == false ) if ( compWidth == "[multi]" && compHeight != "[multi]" ) { var flag = "H"; }  else { var flag = false; }
		//alert(flag);

		    //平面アイテムをリサイズ

		    			    switch ( flag )
		    			    {
		    			        case "WH" :    
		                                           var curWidth = curUsed.width;
		                                           var curHeight = curUsed.height;
		    			                           var newWidth = eval(compWidth);
		    		    	                       var newHeight = eval(compHeight);
		    			                           var calW = (newWidth/curWidth) * curItem.width;
		    		    	                       var calH = (newHeight/curHeight) * curItem.height;
		    		    	                       
		    			                           if(curWidth != newWidth){
		    			                               if(curItem.width == curWidth){
		    			                                   curItem.width = newWidth;
		    			                               }else{
		    			                       	           curItem.width = Math.round(calW)
		    			                               }
		    			                           }
		    			                       
		    			                           if(curHeight != newHeight){
		    			                               if(curItem.height == curHeight){
		    			                                   curItem.height = newHeight;
		    			                               }else{
		    			                       	           curItem.height = Math.round(calH);
		    			                               }
		    			                           }
		    			                           break;
		    			                       
		    			        case "W"   :    
		                                           var curWidth = curUsed.width;
		    			                           var newWidth = eval(compWidth);
		    			                           var calW = (newWidth/curWidth) * curItem.width;
		    		    	                       
		    			                           if(curWidth != newWidth){
		    			                               if(curItem.width == curWidth){
		    			                                   curItem.width = newWidth;
		    			                               }else{
		    			                       	           curItem.width = Math.round(calW);
		    			                               }
		    			                           }
		    			                           break;
		    			                       
		    			        case "H"   :    
		                                           var curHeight = curUsed.height;
		    		    	                       var newHeight = eval(compHeight);
		    		    	                       var calH = (newHeight/curHeight) * curItem.height;
		    		    	                       
		    			                           if(curHeight != newHeight){
		    			                               if(curItem.height == curHeight){
		    			                                   curItem.height = newHeight;
		    			                              }else{
		    			                       	          curItem.height = Math.round(calH);
		    			                               }
		    			                           }
		    			                           break;
		    			    }


}

//********************************************************************************************************************************

function ReChk()
{
	
	chkItems();
	selectComp = new Array();
	
	for(ss=0;ss<selID.length;ss++){
		for(sss=0;sss<cItems.length;sss++){
		    if(selID[ss] == cItems[sss].id){
		    	selectComp[ss] = cItems[sss];
		    }
		}
	}
	
}

//********************************************************************************************************************************

function ChangeCompDuration()
{
	
	//		コンポ尺変更
	if ( compDuration != "[multi]" )
	{
			var n = selectComp.length;
			

			for ( i = 0; i <= n-1; i++ ) {
				
				selectComp[i].duration = compDuration / compFrameRate; 
				
               //全レイヤーの尻をコンポに揃える

                   var LyDur = selectComp[i].duration;
                   var compLys = selectComp[i].layers;
                   //alert(LyDur);
                   for( qq = 1; qq <= compLys.length; qq++)
                   {

                        var lc = false;
                        if(compLys[qq].locked == true)
                        {
                            compLys[qq].locked = false;
                            lc = true;
                        }
                        
                        if(compLys[qq].outPoint >= oldDur[i] || compLys[qq].outPoint >= LyDur){
                            compLys[qq].outPoint = LyDur;
                        }
                        
                        if(lc){
                        	compLys[qq].locked = true;
                            lc = false;
                        }
                   }

			}

	}
	
}

//********************************************************************************************************************************

function chgSolidItems()
{
	var cnt = 1;
	
	do{
		var valN = false;
	    for(aa=1;aa<=allItems.length;aa++){
		    if(allItems[aa].name.lastIndexOf("_addSolid") != -1){
		    	if(allItems[aa].usedIn.length > 0){
		    		mName = new Array();
			        mName = allItems[aa].name.split("_addSolid");

			        for(aaa=1;aaa<=allItems.length;aaa++){
			            if(allItems[aaa].name.lastIndexOf(mName[0] + "_Dep") != -1){
			        	    valCNT = allItems[aaa].name.split(mName[0] + "_Dep");
			        	    cnt = valCNT[1];
			        	    cnt++;
			        	    break;
			            }
			        }

			        allItems[aa].name = mName[0] + "_Dep" + cnt;
			        valN = true;
		    	}else{
		    		allItems[aa].remove();
		    	}
		    }
	    }
	}while(valN);

}

//***************Function END********************************************************************************************


