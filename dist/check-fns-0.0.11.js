/* check-fns 0.0.11 */
(function(){"use strict";var l=function r(t){var n=t.length,e=new Array(n);for(var u=0;u<n;u++){e[u]=t[u]}return e},o={all:function r(t,n,e,u,l){return t&&!t.result?t:n(e,u,l)},or:function r(t,n,e,u,l){return t&&t.result?t:n(e,u,l)}},c=function r(t){return t&&!t.result?t.msg.constructor!=Array?[t.msg]:t.msg:[]};collectAllErrors={all:function r(t,n,e,u,l){var o=n(e,u,l);if(o.result)return t;return{msg:c(t).concat(c(o)),result:t.result&&o.result}},or:function r(t,n,e,u,l){if(t&&t.result)return t;var o=n(e,u,l);if(!t||o&&o.result)return o;return{msg:c(t).concat(c(o)),result:false}}},T=function r(u,l){return function(r,t,n){var e=u(r);return{msg:e?t:l,result:e}}},object=function r(l){return function(n,e,u){return u=u||o,Object.keys(l).reduce(function(r,t){return u.all(r,l[t],n[t],e,u)},{msg:e,result:true})}},ordobject=function r(l){return function(r,t,n){n=n||o;var e={msg:t,result:true};for(var u=0;u<l.length;u+=2){e=n.all(e,l[u+1],r[l[u]],t,n)}return e}},all=function r(){var t=arguments;return function(n,e,u){return u=u||o,l(t).reduce(function(r,t){return u.all(r,t,n,e,u)},{msg:e,result:true})}},or=function r(){var t=arguments;return function(n,e,u){return u=u||o,l(t).reduce(function(r,t){return u.or(r,t,n,e,u)},null)}},ifFail=function r(u,l){return function(r,t,n){var e=u(r,t,n);return e.result?e:{msg:l,result:false}}},V=function r(t,n,e){return function(r){return e=e||o,e.or(null,t,r,n,e)}},validate=function r(t,n,e){return V(t,e,o)(n)},validateAll=function r(t,n,e){return V(t,e,collectAllErrors)(n)};module.exports={T:T,keepFirst:o,collectAllErrors:collectAllErrors,object:object,ordobject:ordobject,all:all,or:or,ifFail:ifFail,validate:validate,validateAll:validateAll,V:V}})();
