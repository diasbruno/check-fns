NYC=./node_modules/.bin/nyc
MOCHA=./node_modules/.bin/mocha
BABEL=./node_modules/.bin/babel

BRANCH=$(shell git rev-parse --abbrev-ref HEAD)
CURRENT_VERSION:=$(shell jq ".version" package.json)

ifdef RELEASE
VERSION:=$(shell read -p "Release $(CURRENT_VERSION) -> " VERSION && echo $$VERSION)
endif

OPTS=

ifdef DEBUG
	OPTS += -w
endif

.PHONY: all
all:
	$(BABEL) src -d .

release-commit:
	@echo "* Release $(CURRENT_VERSION) -> $(VERSION)"
	git add .
	git commit -m "Release $(VERSION)."

release-tag:
	@echo "* Tag"
	git tag "$(VERSION)"

publish-version: release-commit release-tag
	@echo "* Publishing"
	git push upstream "$(BRANCH)" "$(VERSION)"

publish-on-npm:
	@echo "* Publishing on npm"
	npm publish

publish-finished: clean

update-package-version:
	jq 'setpath(["version"]; "$(VERSION)")' < package.json > tmp.json
	mv -f tmp.json package.json

build: all tests

publishing: build update-package-version publish-version publish-on-npm publish-finished

publish:
	RELEASE=1 make -C . publishing

tests:
	$(NYC) mocha tests.js
clean:
	rm -rf index.js
