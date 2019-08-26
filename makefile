NODE_BINS_PATH=./node_modules/.bin

NYC=$(NODE_BINS_PATH)/nyc
MOCHA=$(NODE_BINS_PATH)/mocha
BABEL=$(NODE_BINS_PATH)/babel
UGLIFYJS=$(NODE_BINS_PATH)/uglifyjs

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

update-package-version:
	@echo "* Updating package version"
	jq 'setpath(["version"]; "$(VERSION)")' < package.json > tmp.json
	mv -f tmp.json package.json

compressing:
	@echo "* Compressing"
	$(UGLIFYJS) < index.js > tmp.js
	mv -f tmp.js index.js

standalone-version:
	@echo "* Standalone version"
	$(UGLIFYJS) index.js --rename -m -ie8 > dist/check-fns.js

build: all tests standalone-version compressing

publishing: build update-package-version publish-version publish-on-npm

publish:
	RELEASE=1 make -C . publishing

tests:
	$(NYC) mocha tests.js
clean:
	rm -rf index.js
