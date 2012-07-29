start
  = actions

actions
  = sequence / selection / action

selection
  = _ "{" _ branch:branch _ "}" _ { return branch; }

branch
  = first:actions others:others+ { return [first].concat(others); }
  / actions

others
  = "|" actions:actions { return actions; }

sequence
  = action:action "->" actions:actions { action.next = actions; return action; }
  / action:action { return action; }

action
  = name:name { return { name: name }; }

name
  = _ chars:chars _ { return chars.trim(); }

chars
  = chars:char+ { return chars.join(""); }

char
  = [0-9a-zA-Z @~^,._?!#$%&=/\[\]\(\)]

_ "whitespace" 
  = whitespace*

whitespace
  = [\t\n\r ]
