"use strict";var $Q;!function(t){var n=function(){return function(t,n,i){this.IntX=0,this.IntY=0,this.X=t,this.Y=n,this.ID=i}}();t.Point=n}($Q||($Q={})),function(t){var n=function(){function config(){}return config.NumPointClouds=16,config.NumPoints=32,config.Origin=new t.Point(0,0,0),config.MaxIntCoord=1024,config.LUTSize=64,config.LUTScaleFactor=config.MaxIntCoord/config.LUTSize,config}();t.config=n}($Q||($Q={})),function(t){var n=function(){return function(n,i){this.LUT=[],this.Name=n,this.Points=t.utlis.Resample(i,t.config.NumPoints),this.Points=t.utlis.Scale(this.Points),this.Points=t.utlis.TranslateTo(this.Points,t.config.Origin),this.Points=t.utlis.MakeIntCoords(this.Points),this.LUT=t.utlis.ComputeLUT(this.Points)}}();t.PointCloud=n}($Q||($Q={})),function(t){var n=function(){function QDollarRecognizer(){this.PointClouds=[]}return QDollarRecognizer.prototype.Recognize=function(n){for(var i=Date.now(),o=new t.PointCloud("",n),r=-1,e=1/0,u=0;u<this.PointClouds.length;u++){var a=t.utlis.CloudMatch(o,this.PointClouds[u],e);a<e&&(e=a,r=u)}var s=Date.now();return-1==r?new t.Result("No match.",0,s-i):new t.Result(this.PointClouds[r].Name,e>1?1/e:1,s-i)},QDollarRecognizer.prototype.AddGesture=function(n,i){this.PointClouds[this.PointClouds.length]=new t.PointCloud(n,i);for(var o=0,r=0;r<this.PointClouds.length;r++)this.PointClouds[r].Name==n&&o++;return o},QDollarRecognizer.prototype.ClearUserGestures=function(){this.PointClouds.length=0},QDollarRecognizer}();t.QDollarRecognizer=n}($Q||($Q={})),function(t){var n=function(){return function(t,n,i){this.Name="",this.Score=0,this.Time=0,this.Name=t,this.Score=n,this.Time=i}}();t.Result=n}($Q||($Q={})),function(t){var n=function(){function utlis(){}return utlis.CloudMatch=function(t,n,i){for(var o=t.Points.length,r=Math.floor(Math.pow(o,.5)),e=utlis.ComputeLowerBound(t.Points,n.Points,r,n.LUT),u=utlis.ComputeLowerBound(n.Points,t.Points,r,t.LUT),a=0,s=0;a<o;a+=r,s++)e[s]<i&&(i=Math.min(i,utlis.CloudDistance(t.Points,n.Points,a,i))),u[s]<i&&(i=Math.min(i,utlis.CloudDistance(n.Points,t.Points,a,i)));return i},utlis.CloudDistance=function(t,n,i,o){for(var r=t.length,e=new Array,u=0;u<r;u++)e[u]=u;var a=i,s=r,l=0;do{var c=-1,h=1/0;for(u=0;u<e.length;u++){var f=utlis.SqrEuclideanDistance(t[a],n[e[u]]);f<h&&(h=f,c=u)}if(e.splice(c,1),(l+=s*h)>=o)return l;s--,a=(a+1)%r}while(a!=i);return l},utlis.ComputeLowerBound=function(n,i,o,r){var e=n.length,u=new Array(Math.floor(e/o)+1),a=new Array(e);u[0]=0;for(var s=0;s<e;s++){var l=Math.round(n[s].IntX/t.config.LUTScaleFactor),c=Math.round(n[s].IntY/t.config.LUTScaleFactor),h=r[l][c],f=utlis.SqrEuclideanDistance(n[s],i[h]);a[s]=0==s?f:a[s-1]+f,u[0]+=(e-s)*f}s=o;for(var g=1;s<e;s+=o,g++)u[g]=u[0]+s*a[e-1]-e*a[s-1];return u},utlis.Resample=function(n,i){for(var o=utlis.PathLength(n)/(i-1),r=0,e=new Array(n[0]),u=1;u<n.length;u++)if(n[u].ID==n[u-1].ID){var a=utlis.EuclideanDistance(n[u-1],n[u]);if(r+a>=o){var s=n[u-1].X+(o-r)/a*(n[u].X-n[u-1].X),l=n[u-1].Y+(o-r)/a*(n[u].Y-n[u-1].Y),c=new t.Point(s,l,n[u].ID);e[e.length]=c,n.splice(u,0,c),r=0}else r+=a}return e.length==i-1&&(e[e.length]=new t.Point(n[n.length-1].X,n[n.length-1].Y,n[n.length-1].ID)),e},utlis.Scale=function(n){for(var i=1/0,o=-1/0,r=1/0,e=-1/0,u=0;u<n.length;u++)i=Math.min(i,n[u].X),r=Math.min(r,n[u].Y),o=Math.max(o,n[u].X),e=Math.max(e,n[u].Y);var a=Math.max(o-i,e-r),s=new Array;for(u=0;u<n.length;u++){var l=(n[u].X-i)/a,c=(n[u].Y-r)/a;s[s.length]=new t.Point(l,c,n[u].ID)}return s},utlis.TranslateTo=function(n,i){for(var o=utlis.Centroid(n),r=new Array,e=0;e<n.length;e++){var u=n[e].X+i.X-o.X,a=n[e].Y+i.Y-o.Y;r[r.length]=new t.Point(u,a,n[e].ID)}return r},utlis.Centroid=function(n){for(var i=0,o=0,r=0;r<n.length;r++)i+=n[r].X,o+=n[r].Y;return i/=n.length,o/=n.length,new t.Point(i,o,0)},utlis.PathLength=function(t){for(var n=0,i=1;i<t.length;i++)t[i].ID==t[i-1].ID&&(n+=utlis.EuclideanDistance(t[i-1],t[i]));return n},utlis.MakeIntCoords=function(n){for(var i=0;i<n.length;i++)n[i].IntX=Math.round((n[i].X+1)/2*(t.config.MaxIntCoord-1)),n[i].IntY=Math.round((n[i].Y+1)/2*(t.config.MaxIntCoord-1));return n},utlis.ComputeLUT=function(n){for(var i=new Array,o=0;o<t.config.LUTSize;o++)i[o]=new Array;for(var r=0;r<t.config.LUTSize;r++)for(var e=0;e<t.config.LUTSize;e++){var u=-1,a=1/0;for(o=0;o<n.length;o++){var s=Math.round(n[o].IntX/t.config.LUTScaleFactor),l=Math.round(n[o].IntY/t.config.LUTScaleFactor),c=(s-r)*(s-r)+(l-e)*(l-e);c<a&&(a=c,u=o)}i[r][e]=u}return i},utlis.SqrEuclideanDistance=function(t,n){var i=n.X-t.X,o=n.Y-t.Y;return i*i+o*o},utlis.EuclideanDistance=function(t,n){var i=utlis.SqrEuclideanDistance(t,n);return Math.sqrt(i)},utlis}();t.utlis=n}($Q||($Q={}));