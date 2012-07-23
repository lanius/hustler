
start
  = actions

actions
  = sequence / selection / action

selection
  = _ "{" _ branch:branch _ "}" _ { return branch; }

branch
  = left:actions "|" right:actions { return [left, right];}
  / actions

sequence
  = action:action "->" actions:actions { return { name: action, next: actions }; }
  / action:action { return { name: action } }

action
  = _ chars:chars _ { return chars.trim(); }

chars
  = chars:char+ { return chars.join(""); }

char
  = [ \(\)=@./0-9a-zA-Z]

_ "whitespace" 
  = whitespace*

whitespace
  = [ \t\n\r]
