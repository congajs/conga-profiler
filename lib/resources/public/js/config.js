var config = {
    filter: function(val) {
        if (!this.tags) {
            this.tags = Array.prototype.slice.call(document.getElementsByTagName('dt'));
        }
        val = val.toLowerCase();
        this.tags.forEach(function(tag) {
            var attr = tag.getAttribute('data-key');
            document.querySelectorAll('[data-key="' + attr + '"]').forEach(function (node) {
                node.style.display = attr.toLowerCase().indexOf(val) === -1 ? 'none' : 'block';
            });
        });
    }
};