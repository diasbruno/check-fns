MOCHA=./node_modules/.bin/mocha

OPTS=

ifdef DEBUG
	OPTS += -w
endif

tests:
	$(MOCHA) $(OPTS) tests.js
