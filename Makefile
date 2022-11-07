.PHONY: all build_sass clean

SASS_FILES = $(notdir $(wildcard sass/*.scss))
CSS_FILES = $(patsubst %.scss,%.css,$(SASS_FILES))

SASS_SOURCES=$(addprefix sass/, $(SASS_FILES))
CSS_TARGETS=$(addprefix UserStyles/, $(CSS_FILES))


all: build_sass

build_sass: $(CSS_TARGETS)
# @echo $(SASS_FILES)
# @echo $(CSS_FILES)
# @echo $(SASS_SOURCES)
# @echo $(CSS_TARGETS)

UserStyles/%.css: sass/%.scss
	sass --no-source-map "$<" "$@"
# @echo "$@"

clean:
	rm $(CSS_TARGETS)
