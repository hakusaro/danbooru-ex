import filesize from "filesize";

export default class Comments {
  static initialize() {
    // HACK: "Show all comments" replaces the comment list's HTML then
    // initializes all the reply/edit/vote links. We hook into that
    // initialization here so we can add in our own metadata at the same time.
    Danbooru.Comment.initialize_vote_links = function ($parent) {
        $parent = $parent || $(document);
        $parent.find(".unvote-comment-link").hide();

        Comments.initialize_metadata($parent);
    };

    Comments.initialize_metadata();
  }

  /*
   * Add 'comment #1234' permalink.
   * Add comment scores.
   */
  static initialize_metadata($parent) {
    $parent = $parent || $(document);

    $parent.find('.comment').each((i, e) => {
      const $menu = $(e).find('menu');

      const post_id = $(e).data('post-id');
      const comment_id = $(e).data('comment-id');
      const comment_score = $(e).data('score');

      const $upvote_link = $menu.find(`#comment-vote-up-link-for-${comment_id}`);
      const $downvote_link = $menu.find(`#comment-vote-down-link-for-${comment_id}`);

      if ($menu.children().length > 0) {
        $menu.append($('<li> | </li>'));
      }

      /*
      const $score_container = $('<li></li>');

      $score_container.append($(`
          <span class="info">
              <strong>Score</strong>
              <span>${comment_score}</span>
          </span>
      `));

      $score_container.append(document.createTextNode('(vote '));
      $upvote_link.find('a').appendTo($score_container).text('up');
      $score_container.append(document.createTextNode('/'));
      $downvote_link.find('a').appendTo($score_container).text('down');
      $score_container.append(document.createTextNode(')'));

      $menu.append($score_container);
      */

      $menu.append($(`
        <li>
          <a href="/posts/${post_id}#comment-${comment_id}">Comment #${comment_id}</a>
        </li>
      `));

      $menu.append($(`
        <span class="info">
          <strong>Score</strong>
          <span>${comment_score}</span>
        </span>
      `));
    });
  }

  // Sort tags by type, and put artist tags first.
  static initialize_tag_list() {
    const post_ids = $(".comments-for-post").map((i, e) => $(e).data('post-id')).toArray();

    $.getJSON(`/posts.json?tags=status:any+id:${post_ids.join(',')}`).then(posts => {
      $(".comments-for-post").each((i, comment) => {
        const post_id = $(comment).parent().data('id');
        const post = _.find(posts, { id: post_id });

        const $row = $(`<div class="row"></div>`);

        $row.append($(`
          <span class="info">
            <strong>Post</strong>
            <a href="/posts/${post.id}">#${post.id}</a>
          </span>
        `));

        $row.append($(`
          <span class="info">
            <strong>Size</strong>
            <a href="${post.file_url}">${filesize(post.file_size, { round: 0 })}</a>
            (${post.image_width}x${post.image_height})
          </span>
        `));

        $row.append($(`
          <span class="info">
            <strong>Favorites</strong>
            ${post.fav_count} (<a href="">Fav</a>)
          </span>
        `));

        /*
        $row.append($(`
            <span class="info">
                <strong>Source</strong>
                <a href="${_.escape(post.source)}">${_.escape(post.source)}</a>
            </span>
        `));
        */

        $(comment).find('.header').prepend($row);

        const $tags =
          $(comment)
          .find(".category-0, .category-1, .category-3, .category-4")
          .detach();

        // Sort tags by category, but put general tags (category 0) at the end.
        const $sorted = _.sortBy($tags, t =>
          $(t).attr('class').replace(/category-0/, 'category-5')
        );

        $(comment).find('.list-of-tags').append($sorted);
      });
    });
  }
}