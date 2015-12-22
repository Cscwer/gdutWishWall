app.directive('autoroll', ['$window', '$timeout',
    function($window, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {

                + function($) {
                    'use strict';

                    function transitionEnd() {
                        var el = document.createElement('bootstrap')

                        var transEndEventNames = {
                            WebkitTransition: 'webkitTransitionEnd',
                            MozTransition: 'transitionend',
                            OTransition: 'oTransitionEnd otransitionend',
                            transition: 'transitionend'
                        }

                        for (var name in transEndEventNames) {
                            if (el.style[name] !== undefined) {
                                return {
                                    end: transEndEventNames[name]
                                }
                            }
                        }

                        return false // explicit for ie8 (  ._.)
                    }

                    // http://blog.alexmaccaw.com/css-transitions
                    $.fn.emulateTransitionEnd = function(duration) {
                        var called = false
                        var $el = this
                        $(this).one('bsTransitionEnd', function() {
                            called = true
                        })
                        var callback = function() {
                            if (!called) $($el).trigger($.support.transition.end)
                        }
                        setTimeout(callback, duration)
                        return this
                    }

                    $(function() {
                        $.support.transition = transitionEnd()

                        if (!$.support.transition) return

                        $.event.special.bsTransitionEnd = {
                            bindType: $.support.transition.end,
                            delegateType: $.support.transition.end,
                            handle: function(e) {
                                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
                            }
                        }
                    })

                }(jQuery);


                + function($) {
                    'use strict';

                    // CAROUSEL CLASS DEFINITION
                    // =========================

                    var Carousel = function(element, options) {
                        this.$element = $(element)
                        this.$indicators = this.$element.find('.carousel-indicators')
                        this.options = options
                        this.paused = null
                        this.sliding = null
                        this.interval = null
                        this.$active = null
                        this.$items = null

                        this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

                        this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
                            .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
                            .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
                    }

                    Carousel.VERSION = '3.3.5'

                    Carousel.TRANSITION_DURATION = 600

                    Carousel.DEFAULTS = {
                        interval: 5000,
                        pause: 'hover',
                        wrap: true,
                        keyboard: true
                    }

                    Carousel.prototype.keydown = function(e) {
                        if (/input|textarea/i.test(e.target.tagName)) return
                        switch (e.which) {
                            case 37:
                                this.prev();
                                break
                            case 39:
                                this.next();
                                break
                            default:
                                return
                        }

                        e.preventDefault()
                    }

                    Carousel.prototype.cycle = function(e) {
                        e || (this.paused = false)

                        this.interval && clearInterval(this.interval)

                        this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

                        return this
                    }

                    Carousel.prototype.getItemIndex = function(item) {
                        this.$items = item.parent().children('.item')
                        return this.$items.index(item || this.$active)
                    }

                    Carousel.prototype.getItemForDirection = function(direction, active) {
                        var activeIndex = this.getItemIndex(active)
                        var willWrap = (direction == 'prev' && activeIndex === 0) || (direction == 'next' && activeIndex == (this.$items.length - 1))
                        if (willWrap && !this.options.wrap) return active
                        var delta = direction == 'prev' ? -1 : 1
                        var itemIndex = (activeIndex + delta) % this.$items.length
                        return this.$items.eq(itemIndex)
                    }

                    Carousel.prototype.to = function(pos) {
                        var that = this
                        var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

                        if (pos > (this.$items.length - 1) || pos < 0) return

                        if (this.sliding) return this.$element.one('slid.bs.carousel', function() {
                                that.to(pos)
                            }) // yes, "slid"
                        if (activeIndex == pos) return this.pause().cycle()

                        return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
                    }

                    Carousel.prototype.pause = function(e) {
                        e || (this.paused = true)

                        if (this.$element.find('.next, .prev').length && $.support.transition) {
                            this.$element.trigger($.support.transition.end)
                            this.cycle(true)
                        }

                        this.interval = clearInterval(this.interval)

                        return this
                    }

                    Carousel.prototype.next = function() {
                        if (this.sliding) return
                        return this.slide('next')
                    }

                    Carousel.prototype.prev = function() {
                        if (this.sliding) return
                        return this.slide('prev')
                    }

                    Carousel.prototype.slide = function(type, next) {
                        var $active = this.$element.find('.item.active')
                        var $next = next || this.getItemForDirection(type, $active)
                        var isCycling = this.interval
                        var direction = type == 'next' ? 'left' : 'right'
                        var that = this

                        if ($next.hasClass('active')) return (this.sliding = false)

                        var relatedTarget = $next[0]
                        var slideEvent = $.Event('slide.bs.carousel', {
                            relatedTarget: relatedTarget,
                            direction: direction
                        })
                        this.$element.trigger(slideEvent)
                        if (slideEvent.isDefaultPrevented()) return

                        this.sliding = true

                        isCycling && this.pause()

                        if (this.$indicators.length) {
                            this.$indicators.find('.active').removeClass('active')
                            var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
                            $nextIndicator && $nextIndicator.addClass('active')
                        }

                        var slidEvent = $.Event('slid.bs.carousel', {
                                relatedTarget: relatedTarget,
                                direction: direction
                            }) // yes, "slid"
                        if ($.support.transition && this.$element.hasClass('slide')) {
                            $next.addClass(type)
                            $next[0].offsetWidth // force reflow
                            $active.addClass(direction)
                            $next.addClass(direction)
                            $active
                                .one('bsTransitionEnd', function() {
                                    $next.removeClass([type, direction].join(' ')).addClass('active')
                                    $active.removeClass(['active', direction].join(' '))
                                    that.sliding = false
                                    setTimeout(function() {
                                        that.$element.trigger(slidEvent)
                                    }, 0)
                                })
                                .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
                        } else {
                            $active.removeClass('active')
                            $next.addClass('active')
                            this.sliding = false
                            this.$element.trigger(slidEvent)
                        }

                        isCycling && this.cycle()

                        return this
                    }


                    // CAROUSEL PLUGIN DEFINITION
                    // ==========================

                    function Plugin(option) {
                        return this.each(function() {
                            var $this = $(this)
                            var data = $this.data('bs.carousel')
                            var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
                            var action = typeof option == 'string' ? option : options.slide

                            if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
                            if (typeof option == 'number') data.to(option)
                            else if (action) data[action]()
                            else if (options.interval) data.pause().cycle()
                        })
                    }

                    var old = $.fn.carousel

                    $.fn.carousel = Plugin
                    $.fn.carousel.Constructor = Carousel


                    // CAROUSEL NO CONFLICT
                    // ====================

                    $.fn.carousel.noConflict = function() {
                        $.fn.carousel = old
                        return this
                    }


                    // CAROUSEL DATA-API
                    // =================

                    var clickHandler = function(e) {
                        var href
                        var $this = $(this)
                        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
                        if (!$target.hasClass('carousel')) return
                        var options = $.extend({}, $target.data(), $this.data())
                        var slideIndex = $this.attr('data-slide-to')
                        if (slideIndex) options.interval = false

                        Plugin.call($target, options)

                        if (slideIndex) {
                            $target.data('bs.carousel').to(slideIndex)
                        }

                        e.preventDefault()
                    }

                    $(document)
                        .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
                        .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

                    $(window).on('load', function() {
                        $('[data-ride="carousel"]').each(function() {
                            var $carousel = $(this)
                            Plugin.call($carousel, $carousel.data())
                        })
                    })

                }(jQuery);


                var olelem = elem.find('.carousel-indicators').children();
                var imgelem = elem.find('.carousel-inner');

                var elemindex = 1;
                var handle = function() {
                    elem.find('.carousel-indicators').children()[elemindex].click();
                    elemindex = (elemindex + 1) % 3;
                    $timeout(handle, 10000);
                };
                $timeout(handle, 10000);
            }
        };
    }
]);


app.directive('wishwalltop', ['$window',
    function($window) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.find('.wishwall-navbar-top-btn').on('click', function() {
                    $(this).addClass('active').parent().siblings().find('.wishwall-navbar-top-btn').removeClass('active');
                });
            }
        };
    }
]);

app.directive('wishwallmodal', ['$window',
    function($window) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                + function($) {
                    'use strict';

                    // MODAL CLASS DEFINITION
                    // ======================

                    var Modal = function(element, options) {
                        this.options = options
                        this.$body = $(document.body)
                        this.$element = $(element)
                        this.$dialog = this.$element.find('.modal-dialog')
                        this.$backdrop = null
                        this.isShown = null
                        this.originalBodyPad = null
                        this.scrollbarWidth = 0
                        this.ignoreBackdropClick = false

                        if (this.options.remote) {
                            this.$element
                                .find('.modal-content')
                                .load(this.options.remote, $.proxy(function() {
                                    this.$element.trigger('loaded.bs.modal')
                                }, this))
                        }
                    }

                    Modal.VERSION = '3.3.5'

                    Modal.TRANSITION_DURATION = 300
                    Modal.BACKDROP_TRANSITION_DURATION = 150

                    Modal.DEFAULTS = {
                        backdrop: true,
                        keyboard: true,
                        show: true
                    }

                    Modal.prototype.toggle = function(_relatedTarget) {
                        return this.isShown ? this.hide() : this.show(_relatedTarget)
                    }

                    Modal.prototype.show = function(_relatedTarget) {
                        var that = this
                        var e = $.Event('show.bs.modal', {
                            relatedTarget: _relatedTarget
                        })

                        this.$element.trigger(e)

                        if (this.isShown || e.isDefaultPrevented()) return

                        this.isShown = true

                        this.checkScrollbar()
                        this.setScrollbar()
                        this.$body.addClass('modal-open')

                        this.escape()
                        this.resize()

                        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

                        this.$dialog.on('mousedown.dismiss.bs.modal', function() {
                            that.$element.one('mouseup.dismiss.bs.modal', function(e) {
                                if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
                            })
                        })

                        this.backdrop(function() {
                            var transition = $.support.transition && that.$element.hasClass('fade')

                            if (!that.$element.parent().length) {
                                that.$element.appendTo(that.$body) // don't move modals dom position
                            }

                            that.$element
                                .show()
                                .scrollTop(0)

                            that.adjustDialog()

                            if (transition) {
                                that.$element[0].offsetWidth // force reflow
                            }

                            that.$element.addClass('in')

                            that.enforceFocus()

                            var e = $.Event('shown.bs.modal', {
                                relatedTarget: _relatedTarget
                            })

                            transition ?
                                that.$dialog // wait for modal to slide in
                            .one('bsTransitionEnd', function() {
                                that.$element.trigger('focus').trigger(e)
                            })
                                .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                                that.$element.trigger('focus').trigger(e)
                        })
                    }

                    Modal.prototype.hide = function(e) {
                        if (e) e.preventDefault()

                        e = $.Event('hide.bs.modal')

                        this.$element.trigger(e)

                        if (!this.isShown || e.isDefaultPrevented()) return

                        this.isShown = false

                        this.escape()
                        this.resize()

                        $(document).off('focusin.bs.modal')

                        this.$element
                            .removeClass('in')
                            .off('click.dismiss.bs.modal')
                            .off('mouseup.dismiss.bs.modal')

                        this.$dialog.off('mousedown.dismiss.bs.modal')

                        $.support.transition && this.$element.hasClass('fade') ?
                            this.$element
                            .one('bsTransitionEnd', $.proxy(this.hideModal, this))
                            .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                            this.hideModal()
                    }

                    Modal.prototype.enforceFocus = function() {
                        $(document)
                            .off('focusin.bs.modal') // guard against infinite focus loop
                        .on('focusin.bs.modal', $.proxy(function(e) {
                            if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                                this.$element.trigger('focus')
                            }
                        }, this))
                    }

                    Modal.prototype.escape = function() {
                        if (this.isShown && this.options.keyboard) {
                            this.$element.on('keydown.dismiss.bs.modal', $.proxy(function(e) {
                                e.which == 27 && this.hide()
                            }, this))
                        } else if (!this.isShown) {
                            this.$element.off('keydown.dismiss.bs.modal')
                        }
                    }

                    Modal.prototype.resize = function() {
                        if (this.isShown) {
                            $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
                        } else {
                            $(window).off('resize.bs.modal')
                        }
                    }

                    Modal.prototype.hideModal = function() {
                        var that = this
                        this.$element.hide()
                        this.backdrop(function() {
                            that.$body.removeClass('modal-open')
                            that.resetAdjustments()
                            that.resetScrollbar()
                            that.$element.trigger('hidden.bs.modal')
                        })
                    }

                    Modal.prototype.removeBackdrop = function() {
                        this.$backdrop && this.$backdrop.remove()
                        this.$backdrop = null
                    }

                    Modal.prototype.backdrop = function(callback) {
                        var that = this
                        var animate = this.$element.hasClass('fade') ? 'fade' : ''

                        if (this.isShown && this.options.backdrop) {
                            var doAnimate = $.support.transition && animate

                            this.$backdrop = $(document.createElement('div'))
                                .addClass('modal-backdrop ' + animate)
                                .appendTo(this.$body)

                            this.$element.on('click.dismiss.bs.modal', $.proxy(function(e) {
                                if (this.ignoreBackdropClick) {
                                    this.ignoreBackdropClick = false
                                    return
                                }
                                if (e.target !== e.currentTarget) return
                                this.options.backdrop == 'static' ? this.$element[0].focus() : this.hide()
                            }, this))

                            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

                            this.$backdrop.addClass('in')

                            if (!callback) return

                            doAnimate ?
                                this.$backdrop
                                .one('bsTransitionEnd', callback)
                                .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                                callback()

                        } else if (!this.isShown && this.$backdrop) {
                            this.$backdrop.removeClass('in')

                            var callbackRemove = function() {
                                that.removeBackdrop()
                                callback && callback()
                            }
                            $.support.transition && this.$element.hasClass('fade') ?
                                this.$backdrop
                                .one('bsTransitionEnd', callbackRemove)
                                .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                                callbackRemove()

                        } else if (callback) {
                            callback()
                        }
                    }

                    // these following methods are used to handle overflowing modals

                    Modal.prototype.handleUpdate = function() {
                        this.adjustDialog()
                    }

                    Modal.prototype.adjustDialog = function() {
                        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

                        this.$element.css({
                            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
                            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
                        })
                    }

                    Modal.prototype.resetAdjustments = function() {
                        this.$element.css({
                            paddingLeft: '',
                            paddingRight: ''
                        })
                    }

                    Modal.prototype.checkScrollbar = function() {
                        var fullWindowWidth = window.innerWidth
                        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
                            var documentElementRect = document.documentElement.getBoundingClientRect()
                            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
                        }
                        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
                        this.scrollbarWidth = this.measureScrollbar()
                    }

                    Modal.prototype.setScrollbar = function() {
                        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
                        this.originalBodyPad = document.body.style.paddingRight || ''
                        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
                    }

                    Modal.prototype.resetScrollbar = function() {
                        this.$body.css('padding-right', this.originalBodyPad)
                    }

                    Modal.prototype.measureScrollbar = function() { // thx walsh
                        var scrollDiv = document.createElement('div')
                        scrollDiv.className = 'modal-scrollbar-measure'
                        this.$body.append(scrollDiv)
                        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
                        this.$body[0].removeChild(scrollDiv)
                        return scrollbarWidth
                    }



                    function Plugin(option, _relatedTarget) {
                        return this.each(function() {
                            var $this = $(this)
                            var data = $this.data('bs.modal')
                            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

                            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
                            if (typeof option == 'string') data[option](_relatedTarget)
                            else if (options.show) data.show(_relatedTarget)
                        })
                    }

                    var old = $.fn.modal

                    $.fn.modal = Plugin
                    $.fn.modal.Constructor = Modal


                    // MODAL NO CONFLICT
                    // =================

                    $.fn.modal.noConflict = function() {
                        $.fn.modal = old
                        return this
                    }


                    // MODAL DATA-API
                    // ==============

                    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {
                        var $this = $(this)
                        var href = $this.attr('href')
                        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
                        var option = $target.data('bs.modal') ? 'toggle' : $.extend({
                            remote: !/#/.test(href) && href
                        }, $target.data(), $this.data())

                        if ($this.is('a')) e.preventDefault()

                        $target.one('show.bs.modal', function(showEvent) {
                            if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
                            $target.one('hidden.bs.modal', function() {
                                $this.is(':visible') && $this.trigger('focus')
                            })
                        })
                        Plugin.call($target, option, this)
                    })

                }(jQuery);


                elem.on('click', '.navbar-fixed-bottom .btn-navbar', function() {
                    $(this).addClass('active').siblings('.btn-navbar').removeClass('active');
                });


            }
        }
    }
]);

app.directive('wishwallsearch', ['$window',
    function($window) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.find('.wishwall-dropdown-btn, .wishwall-dropdown-menu li').on('click', function() {
                    elem.find('.wishwall-dropdown-menu').toggle();
                });
              

                elem.find('input').on('keyup', function() {
                    if (scope.searchinput !== '') {
                        elem.find('.wishwall-search-content, .modal-footer, .fa-remove').hide();
                        elem.find('.dosearch, .wishwall-search-result').show();

                    } else {
                        elem.find('.wishwall-search-content, .modal-footer, .fa-remove').show();
                        elem.find('.dosearch, .wishwall-search-result').hide();
                    }
                });

                elem.find('.dosearch').on('click', function() {
                    elem.find('.dosearch').hide().prev().show();
                    // elem.find('.wishwall-search-content, .modal-footer, .fa-remove').show();
                    // elem.find('.dosearch').hide();
                });
                elem.on('click', '.pick_this', function() {
                    console.log('aa');
                    if(scope.sure_to_pick) {
                        elem.find('.fa-remove').click();
                    }
                });
            }
        };
    }
]);