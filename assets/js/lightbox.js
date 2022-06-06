const lightbox = (trigger) => {

    const buildItemObject = (element) => {
        return {
            src: element.getAttribute('src'),
            msrc: element.getAttribute('src'),
            w: element.getAttribute('width'),
            h: element.getAttribute('height'),
            el: element,
        }
    };

    const onThumbnailsClick = (e) =>{
        e.preventDefault();

        let items = [];
        let index = 0;

        let prevSibling = e.target.closest('.kg-card').previousElementSibling;

        while (prevSibling && (prevSibling.classList.contains('kg-image-card') || prevSibling.classList.contains('kg-gallery-card'))) {
            let prevItems = [];

            prevSibling.querySelectorAll('img').forEach((item) => {
                prevItems.push(buildItemObject(item));
                index += 1;
            });
            prevSibling = prevSibling.previousElementSibling;

            items = prevItems.concat(items);
        };

        if (e.target.classList.contains('kg-image')) {
            items.push(buildItemObject(e.target));
        } else {
            let reachedCurrentItem = false;

            e.target.closest('.kg-gallery-card').querySelectorAll('img').forEach((item) => {
                items.push(buildItemObject(item));

                if (!reachedCurrentItem && item !== e.target) {
                    index += 1;
                } else {
                    reachedCurrentItem = true;
                }
            });
        };

        let nextSibling = e.target.closest('.kg-card').nextElementSibling;

        while (nextSibling && (nextSibling.classList.contains('kg-image-card') || nextSibling.classList.contains('kg-gallery-card'))) {
            nextSibling.querySelectorAll('img').forEach((item) => {
                items.push(buildItemObject(item));
            });
            nextSibling = nextSibling.nextElementSibling;
        };

        const pswpElement = document.querySelectorAll('.pswp')[0];

        const options = {
            bgOpacity: 0.9,
            closeOnScroll: true,
            fullscreenEl: false,
            history: false,
            index: index,
            shareEl: false,
            zoomEl: false,
            getThumbBoundsFn: function(index) {
                const thumbnail = items[index].el,
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect();

                return {
                    x: rect.left,
                    y: rect.top + pageYScroll,
                    w: rect.width
                };
            }
        };

        const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.init();

        return false;
    };

    const triggers = document.querySelectorAll(trigger);

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            onThumbnailsClick(e);
        });
    });
}

(function () {
    const selector = '.kg-image-card > .kg-image[width][height], .kg-gallery-image > img';

    lightbox(selector);

    document.querySelectorAll(selector).forEach((item) => {
        item.classList.add('will-open-in-lightbox');
    });
})();
