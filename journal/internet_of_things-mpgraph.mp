% collected graphics of job "internet_of_things"
mpgraph:=4000;
randomseed:=1;
_special_div_ := 10000; 
if unknown context_tool: input mp-tool; fi;
if unknown context_spec: input mp-spec; fi;
if unknown context_grph: input mp-grph; fi;

graphictextformat:="context";
graphictextdirective "\global \loadfontfileoncetrue ";

string contextversion;
contextversion:="2008.05.21 15:21";

boolean collapse_data; collapse_data:=true;
def data_mpd_file = "internet_of_things-mp.mpd" enddef ;
def data_mpo_file = "internet_of_things-mp.mpo" enddef ;
def data_mpy_file = "internet_of_things-mp.mpy" enddef ;


color OverlayColor,OverlayLineColor;

def initialize_form_numbers =
do_initialize_numbers;
enddef;

vardef ForegroundBox =
unitsquare xysized(HSize,VSize)
enddef ;
vardef PageFraction =
if 1>1: (1-1)/(1-1) else: 1 fi
enddef ;

string txtfile ; txtfile := "internet_of_things-mpgraph.mpb" ;
string txtfont ; txtfont := "texnansi-lmtt10" ;
string txtpref ; txtpref := "00001::::" ;

if unknown context_page: input mp-page; fi;

boolean PageStateAvailable,OnRightPage,InPageBody;
PageStateAvailable:=true;

path PlainTextArea;

if unknown context_core : input mp-core.mp ; fi ;
;
def triangle (expr wid, rot, col) =
x1 := x3 := y1 := 0 ; x2 := y3 := wid ; y2 := .5y3 ;
fill (z1--z2--z3--cycle) rotated rot withcolor col ;
currentpicture := currentpicture xysized (wid,wid) ;
enddef ;

defaultfont:="ptmr8t";
defaultscale:=14.4pt/10pt;

cmykcolors:=true;
spotcolors:=true;

OverlayWidth:=600.0pt  ;
OverlayHeight:=450.0pt  ;
OverlayDepth:=450.0pt  ;
OverlayColor:=(scaledgray(.80,1));
OverlayLineWidth:=0.0pt ;
OverlayLineColor:=(0,0,0);
BaseLineSkip:=18.14395pt;
LineHeight:=18.14395pt;
BodyFontSize:=14.4pt;
TopSkip:=14.4pt;
StrutHeight:=13.06366pt;
StrutDepth:=5.08028pt;
CurrentWidth:=600.0pt;
CurrentHeight:=450.0pt;
EmWidth:=14.4pt;
ExHeight:=6.47998pt;
PageNumber:=1;
RealPageNumber:=1;
LastPageNumber:= 1;

prologues:=1;
mpprocset:=1;

HSize:=600.0pt;
VSize:=450.0pt;

mp_shade_version := 2 ;

OnRightPage:=true;
InPageBody:=true ;

def LoadPageState =
OnRightPage:=true;
OnOddPage:=true;
RealPageNumber:=1;
PageNumber:=1;
NOfPages:=1;
PaperHeight:=450.0pt;
PaperWidth:=600.0pt;
PrintPaperHeight:=450.0pt;
PrintPaperWidth:=600.0pt;
TopSpace:=15.0pt;
BottomSpace:=35.0pt;
BackSpace:=15.0pt;
CutSpace:=55.0pt;
MakeupHeight:=400.0pt;
MakeupWidth:=530.0pt;
TopHeight:=0.0pt;
TopDistance:=0.0pt;
HeaderHeight:=0.0pt;
HeaderDistance:=0.0pt;
TextHeight:=400.0pt;
FooterDistance:=0.0pt;
FooterHeight:=0.0pt;
BottomDistance:=15.0pt;
BottomHeight:=10.0pt;
LeftEdgeWidth:=0.0pt;
LeftEdgeDistance:=0.0pt;
LeftMarginWidth:=0.0pt;
LeftMarginDistance:=0.0pt;
TextWidth:=530.0pt;
RightMarginDistance:=0.0pt;
RightMarginWidth:=0.0pt;
RightEdgeDistance:=15.0pt;
RightEdgeWidth:=30.0pt;
InnerMarginDistance:=0.0pt;
InnerMarginWidth:=0.0pt;
OuterMarginDistance:=0.0pt;
OuterMarginWidth:=0.0pt;
InnerEdgeDistance:=0.0pt;
InnerEdgeWidth:=0.0pt;
OuterEdgeDistance:=15.0pt;
OuterEdgeWidth:=30.0pt;
PageOffset:=0.0pt;
PageDepth:=0.0pt;
LayoutColumns:=1;
LayoutColumnDistance:=0.0pt;
LayoutColumnWidth:=530.0pt;
enddef;

ResetTextAreas;
;
SaveTextAreas;
ResetTextAreas;
;
;
PlainTextArea:=boundingbox((0pt,0pt)--(0pt,0pt)
shifted (0pt,0pt));

local_multi_par_area:=false;
;
let mprunend = end ;
beginfig(4000);
color c ; path p ;
for i=1 upto 250 :
x0 := uniformdeviate 600.0pt  ;
y0 := uniformdeviate 450.0pt  ;
sx := uniformdeviate 20 ;
sy := uniformdeviate 20 ;
cc := round(uniformdeviate 2) ;
if cc=0 : c := (scaledrgb(0,0,.6,1)) fi ;
if cc=1 : c := (scaledrgb(.6,0,0,1)) fi ;
if cc=2 : c := (scaledrgb(.6,.6,0,1)) fi ;
qq := round(uniformdeviate 1) ;
if qq=0 :
p := unitsquare xscaled sx yscaled sy ;
else :
rr := round(uniformdeviate 3) * 90 ;
x1 := x3 := y1 := 0 ; x2 := y3 := sx; y2 := .5y3 ;
p := (z1--z2--z3--cycle) rotated rr ;
fi ;
fill p shifted z0 withcolor c ;
endfor ;

endfig;
let end=mprunend;
defaultfont:="ptmr8t";
defaultscale:=14.4pt/10pt;

cmykcolors:=true;
spotcolors:=true;

OverlayWidth:=30.0pt  ;
OverlayHeight:=400.0pt  ;
OverlayDepth:=400.0pt  ;
OverlayColor:=(0,0,0);
OverlayLineWidth:=0pt ;
OverlayLineColor:=(0,0,0);
BaseLineSkip:=18.14395pt;
LineHeight:=18.14395pt;
BodyFontSize:=14.4pt;
TopSkip:=14.4pt;
StrutHeight:=13.06366pt;
StrutDepth:=5.08028pt;
CurrentWidth:=30.0pt;
CurrentHeight:=400.0pt;
EmWidth:=14.4pt;
ExHeight:=6.63838pt;
PageNumber:=1;
RealPageNumber:=2;
LastPageNumber:= 2;

prologues:=1;
mpprocset:=1;

HSize:=30.0pt;
VSize:=400.0pt;

mp_shade_version := 2 ;

OnRightPage:=true;
InPageBody:=true ;

def LoadPageState =
OnRightPage:=true;
OnOddPage:=false;
RealPageNumber:=2;
PageNumber:=1;
NOfPages:=2;
PaperHeight:=450.0pt;
PaperWidth:=600.0pt;
PrintPaperHeight:=450.0pt;
PrintPaperWidth:=600.0pt;
TopSpace:=15.0pt;
BottomSpace:=35.0pt;
BackSpace:=15.0pt;
CutSpace:=55.0pt;
MakeupHeight:=400.0pt;
MakeupWidth:=530.0pt;
TopHeight:=0.0pt;
TopDistance:=0.0pt;
HeaderHeight:=0.0pt;
HeaderDistance:=0.0pt;
TextHeight:=400.0pt;
FooterDistance:=0.0pt;
FooterHeight:=0.0pt;
BottomDistance:=15.0pt;
BottomHeight:=10.0pt;
LeftEdgeWidth:=0.0pt;
LeftEdgeDistance:=0.0pt;
LeftMarginWidth:=0.0pt;
LeftMarginDistance:=0.0pt;
TextWidth:=530.0pt;
RightMarginDistance:=0.0pt;
RightMarginWidth:=0.0pt;
RightEdgeDistance:=15.0pt;
RightEdgeWidth:=30.0pt;
InnerMarginDistance:=0.0pt;
InnerMarginWidth:=0.0pt;
OuterMarginDistance:=0.0pt;
OuterMarginWidth:=0.0pt;
InnerEdgeDistance:=0.0pt;
InnerEdgeWidth:=0.0pt;
OuterEdgeDistance:=15.0pt;
OuterEdgeWidth:=30.0pt;
PageOffset:=0.0pt;
PageDepth:=0.0pt;
LayoutColumns:=1;
LayoutColumnDistance:=0.0pt;
LayoutColumnWidth:=530.0pt;
enddef;

ResetTextAreas;
;
SaveTextAreas;
ResetTextAreas;
;
;
PlainTextArea:=boundingbox((0pt,0pt)--(0pt,0pt)
shifted (0pt,0pt));

local_multi_par_area:=false;
;
let mprunend = end ;
beginfig(3999);

triangle(29.20001pt,90,(scaledrgb(0,0,.6,1))) ;

endfig;
let end=mprunend;
defaultfont:="ptmr8t";
defaultscale:=14.4pt/10pt;

cmykcolors:=true;
spotcolors:=true;

OverlayWidth:=30.0pt  ;
OverlayHeight:=400.0pt  ;
OverlayDepth:=400.0pt  ;
OverlayColor:=(0,0,0);
OverlayLineWidth:=0pt ;
OverlayLineColor:=(0,0,0);
BaseLineSkip:=18.14395pt;
LineHeight:=18.14395pt;
BodyFontSize:=14.4pt;
TopSkip:=14.4pt;
StrutHeight:=13.06366pt;
StrutDepth:=5.08028pt;
CurrentWidth:=30.0pt;
CurrentHeight:=400.0pt;
EmWidth:=14.4pt;
ExHeight:=6.63838pt;
PageNumber:=1;
RealPageNumber:=2;
LastPageNumber:= 2;

prologues:=1;
mpprocset:=1;

HSize:=30.0pt;
VSize:=400.0pt;

mp_shade_version := 2 ;

OnRightPage:=true;
InPageBody:=true ;

def LoadPageState =
OnRightPage:=true;
OnOddPage:=false;
RealPageNumber:=2;
PageNumber:=1;
NOfPages:=2;
PaperHeight:=450.0pt;
PaperWidth:=600.0pt;
PrintPaperHeight:=450.0pt;
PrintPaperWidth:=600.0pt;
TopSpace:=15.0pt;
BottomSpace:=35.0pt;
BackSpace:=15.0pt;
CutSpace:=55.0pt;
MakeupHeight:=400.0pt;
MakeupWidth:=530.0pt;
TopHeight:=0.0pt;
TopDistance:=0.0pt;
HeaderHeight:=0.0pt;
HeaderDistance:=0.0pt;
TextHeight:=400.0pt;
FooterDistance:=0.0pt;
FooterHeight:=0.0pt;
BottomDistance:=15.0pt;
BottomHeight:=10.0pt;
LeftEdgeWidth:=0.0pt;
LeftEdgeDistance:=0.0pt;
LeftMarginWidth:=0.0pt;
LeftMarginDistance:=0.0pt;
TextWidth:=530.0pt;
RightMarginDistance:=0.0pt;
RightMarginWidth:=0.0pt;
RightEdgeDistance:=15.0pt;
RightEdgeWidth:=30.0pt;
InnerMarginDistance:=0.0pt;
InnerMarginWidth:=0.0pt;
OuterMarginDistance:=0.0pt;
OuterMarginWidth:=0.0pt;
InnerEdgeDistance:=0.0pt;
InnerEdgeWidth:=0.0pt;
OuterEdgeDistance:=15.0pt;
OuterEdgeWidth:=30.0pt;
PageOffset:=0.0pt;
PageDepth:=0.0pt;
LayoutColumns:=1;
LayoutColumnDistance:=0.0pt;
LayoutColumnWidth:=530.0pt;
enddef;

ResetTextAreas;
;
SaveTextAreas;
ResetTextAreas;
;
;
PlainTextArea:=boundingbox((0pt,0pt)--(0pt,0pt)
shifted (0pt,0pt));

local_multi_par_area:=false;
;
let mprunend = end ;
beginfig(3998);

triangle(29.20001pt,270,(scaledrgb(0,0,.6,1))) ;

endfig;
let end=mprunend;
defaultfont:="ptmr8t";
defaultscale:=14.4pt/10pt;

cmykcolors:=true;
spotcolors:=true;

OverlayWidth:=30.0pt  ;
OverlayHeight:=400.0pt  ;
OverlayDepth:=400.0pt  ;
OverlayColor:=(0,0,0);
OverlayLineWidth:=0pt ;
OverlayLineColor:=(0,0,0);
BaseLineSkip:=18.14395pt;
LineHeight:=18.14395pt;
BodyFontSize:=14.4pt;
TopSkip:=14.4pt;
StrutHeight:=13.06366pt;
StrutDepth:=5.08028pt;
CurrentWidth:=30.0pt;
CurrentHeight:=400.0pt;
EmWidth:=14.4pt;
ExHeight:=6.63838pt;
PageNumber:=1;
RealPageNumber:=2;
LastPageNumber:= 2;

prologues:=1;
mpprocset:=1;

HSize:=30.0pt;
VSize:=400.0pt;

mp_shade_version := 2 ;

OnRightPage:=true;
InPageBody:=true ;

def LoadPageState =
OnRightPage:=true;
OnOddPage:=false;
RealPageNumber:=2;
PageNumber:=1;
NOfPages:=2;
PaperHeight:=450.0pt;
PaperWidth:=600.0pt;
PrintPaperHeight:=450.0pt;
PrintPaperWidth:=600.0pt;
TopSpace:=15.0pt;
BottomSpace:=35.0pt;
BackSpace:=15.0pt;
CutSpace:=55.0pt;
MakeupHeight:=400.0pt;
MakeupWidth:=530.0pt;
TopHeight:=0.0pt;
TopDistance:=0.0pt;
HeaderHeight:=0.0pt;
HeaderDistance:=0.0pt;
TextHeight:=400.0pt;
FooterDistance:=0.0pt;
FooterHeight:=0.0pt;
BottomDistance:=15.0pt;
BottomHeight:=10.0pt;
LeftEdgeWidth:=0.0pt;
LeftEdgeDistance:=0.0pt;
LeftMarginWidth:=0.0pt;
LeftMarginDistance:=0.0pt;
TextWidth:=530.0pt;
RightMarginDistance:=0.0pt;
RightMarginWidth:=0.0pt;
RightEdgeDistance:=15.0pt;
RightEdgeWidth:=30.0pt;
InnerMarginDistance:=0.0pt;
InnerMarginWidth:=0.0pt;
OuterMarginDistance:=0.0pt;
OuterMarginWidth:=0.0pt;
InnerEdgeDistance:=0.0pt;
InnerEdgeWidth:=0.0pt;
OuterEdgeDistance:=15.0pt;
OuterEdgeWidth:=30.0pt;
PageOffset:=0.0pt;
PageDepth:=0.0pt;
LayoutColumns:=1;
LayoutColumnDistance:=0.0pt;
LayoutColumnWidth:=530.0pt;
enddef;

ResetTextAreas;
;
SaveTextAreas;
ResetTextAreas;
;
;
PlainTextArea:=boundingbox((0pt,0pt)--(0pt,0pt)
shifted (0pt,0pt));

local_multi_par_area:=false;
;
let mprunend = end ;
beginfig(3997);

triangle(29.20001pt,180,(scaledgray(.6,1))) ;

endfig;
let end=mprunend;
defaultfont:="ptmr8t";
defaultscale:=14.4pt/10pt;

cmykcolors:=true;
spotcolors:=true;

OverlayWidth:=30.0pt  ;
OverlayHeight:=400.0pt  ;
OverlayDepth:=400.0pt  ;
OverlayColor:=(0,0,0);
OverlayLineWidth:=0pt ;
OverlayLineColor:=(0,0,0);
BaseLineSkip:=18.14395pt;
LineHeight:=18.14395pt;
BodyFontSize:=14.4pt;
TopSkip:=14.4pt;
StrutHeight:=13.06366pt;
StrutDepth:=5.08028pt;
CurrentWidth:=30.0pt;
CurrentHeight:=400.0pt;
EmWidth:=14.4pt;
ExHeight:=6.63838pt;
PageNumber:=1;
RealPageNumber:=2;
LastPageNumber:= 2;

prologues:=1;
mpprocset:=1;

HSize:=30.0pt;
VSize:=400.0pt;

mp_shade_version := 2 ;

OnRightPage:=true;
InPageBody:=true ;

def LoadPageState =
OnRightPage:=true;
OnOddPage:=false;
RealPageNumber:=2;
PageNumber:=1;
NOfPages:=2;
PaperHeight:=450.0pt;
PaperWidth:=600.0pt;
PrintPaperHeight:=450.0pt;
PrintPaperWidth:=600.0pt;
TopSpace:=15.0pt;
BottomSpace:=35.0pt;
BackSpace:=15.0pt;
CutSpace:=55.0pt;
MakeupHeight:=400.0pt;
MakeupWidth:=530.0pt;
TopHeight:=0.0pt;
TopDistance:=0.0pt;
HeaderHeight:=0.0pt;
HeaderDistance:=0.0pt;
TextHeight:=400.0pt;
FooterDistance:=0.0pt;
FooterHeight:=0.0pt;
BottomDistance:=15.0pt;
BottomHeight:=10.0pt;
LeftEdgeWidth:=0.0pt;
LeftEdgeDistance:=0.0pt;
LeftMarginWidth:=0.0pt;
LeftMarginDistance:=0.0pt;
TextWidth:=530.0pt;
RightMarginDistance:=0.0pt;
RightMarginWidth:=0.0pt;
RightEdgeDistance:=15.0pt;
RightEdgeWidth:=30.0pt;
InnerMarginDistance:=0.0pt;
InnerMarginWidth:=0.0pt;
OuterMarginDistance:=0.0pt;
OuterMarginWidth:=0.0pt;
InnerEdgeDistance:=0.0pt;
InnerEdgeWidth:=0.0pt;
OuterEdgeDistance:=15.0pt;
OuterEdgeWidth:=30.0pt;
PageOffset:=0.0pt;
PageDepth:=0.0pt;
LayoutColumns:=1;
LayoutColumnDistance:=0.0pt;
LayoutColumnWidth:=530.0pt;
enddef;

ResetTextAreas;
;
SaveTextAreas;
ResetTextAreas;
;
;
PlainTextArea:=boundingbox((0pt,0pt)--(0pt,0pt)
shifted (0pt,0pt));

local_multi_par_area:=false;
;
let mprunend = end ;
beginfig(3996);

triangle(29.20001pt,0,(scaledgray(.6,1))) ;

endfig;
let end=mprunend;
