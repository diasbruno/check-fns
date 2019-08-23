MOCHA=./node_modules/.bin/mocha

OPTS=

ifdef DEBUG
	OPTS += --inspect-brk
endif

tests:
	$(MOCHA) $(OPTS) tests.js
